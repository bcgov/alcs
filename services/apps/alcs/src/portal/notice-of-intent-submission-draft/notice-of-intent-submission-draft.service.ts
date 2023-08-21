import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentSubmissionStatusService } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { User } from '../../user/user.entity';
import { NoticeOfIntentOwnerService } from '../notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelUpdateDto } from '../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.dto';
import { NoticeOfIntentParcelService } from '../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission/notice-of-intent-submission.service';

@Injectable()
export class NoticeOfIntentSubmissionDraftService {
  private logger = new Logger(NoticeOfIntentSubmissionDraftService.name);

  constructor(
    @InjectRepository(NoticeOfIntentSubmission)
    private noticeOfIntentSubmissionRepository: Repository<NoticeOfIntentSubmission>,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentParcelService: NoticeOfIntentParcelService,
    private noticeOfIntentOwnerService: NoticeOfIntentOwnerService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
  ) {}

  async getOrCreateDraft(fileNumber: string, user: User) {
    const existingDraft = await this.getDraft(fileNumber);

    if (existingDraft) {
      return existingDraft;
    } else {
      return this.createDraft(fileNumber, user);
    }
  }

  private async getDraft(fileNumber: string) {
    return await this.noticeOfIntentSubmissionRepository.findOne({
      where: {
        fileNumber: fileNumber,
        isDraft: true,
      },
      relations: {
        createdBy: true,
        owners: {
          type: true,
          corporateSummary: {
            document: true,
          },
          parcels: true,
        },
      },
    });
  }

  private async createDraft(
    fileNumber: string,
    user: User,
  ): Promise<NoticeOfIntentSubmission> {
    const originalSubmission =
      await this.noticeOfIntentSubmissionRepository.findOne({
        where: {
          fileNumber: fileNumber,
          isDraft: false,
        },
        relations: {
          createdBy: true,
          owners: {
            type: true,
          },
          parcels: {
            certificateOfTitle: true,
            owners: true,
          },
        },
      });

    if (!originalSubmission) {
      throw new BadRequestException(
        "Cannot edit a submission that doesn't exist",
      );
    }

    const newSubmission = new NoticeOfIntentSubmission({
      ...originalSubmission,
      uuid: undefined,
      auditCreatedAt: undefined,
      auditUpdatedAt: undefined,
      isDraft: true,
      parcels: [],
      owners: [],
    });
    const savedSubmission = await this.noticeOfIntentSubmissionRepository.save(
      newSubmission,
    );
    const statuses =
      await this.noticeOfIntentSubmissionStatusService.getCopiedStatuses(
        originalSubmission.uuid,
        newSubmission.uuid,
      );

    await this.noticeOfIntentSubmissionRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(newSubmission);

        await transactionalEntityManager.save(statuses);
      },
    );

    const ownerUuidMap = new Map<string, string>();
    for (const owner of originalSubmission.owners) {
      const savedOwner = await this.noticeOfIntentOwnerService.create(
        {
          firstName: owner.firstName ?? undefined,
          lastName: owner.lastName ?? undefined,
          typeCode: owner.type.code ?? undefined,
          corporateSummaryUuid: owner.corporateSummaryUuid ?? undefined,
          email: owner.email ?? undefined,
          phoneNumber: owner.phoneNumber ?? undefined,
          organizationName: owner.organizationName ?? undefined,
          noticeOfIntentSubmissionUuid: savedSubmission.uuid,
        },
        savedSubmission,
      );
      ownerUuidMap.set(owner.uuid, savedOwner.uuid);
    }

    const updateDtos: NoticeOfIntentParcelUpdateDto[] = [];
    for (const parcel of originalSubmission.parcels) {
      const savedParcel = await this.noticeOfIntentParcelService.create(
        savedSubmission.uuid,
      );
      updateDtos.push({
        ...parcel,
        uuid: savedParcel.uuid,
        ownerUuids: parcel.owners.map(
          (oldOwner) => ownerUuidMap.get(oldOwner.uuid)!,
        ),
        purchasedDate: parcel.purchasedDate
          ? parcel.purchasedDate.getTime()
          : undefined,
      });

      //Copy certificate of titles
      if (parcel.certificateOfTitle) {
        await this.noticeOfIntentParcelService.setCertificateOfTitle(
          savedParcel,
          parcel.certificateOfTitle,
        );
      }
    }
    await this.noticeOfIntentParcelService.update(updateDtos, user);

    //Copy over Primary Contact
    if (originalSubmission.primaryContactOwnerUuid) {
      const mappedOwnerUuid = (savedSubmission.primaryContactOwnerUuid =
        ownerUuidMap.get(originalSubmission.primaryContactOwnerUuid));
      await this.noticeOfIntentSubmissionRepository.update(
        {
          uuid: savedSubmission.uuid,
        },
        {
          primaryContactOwnerUuid: mappedOwnerUuid,
        },
      );
    }

    this.logger.debug(`Draft Created for File Number ${fileNumber}`);

    const submission = await this.getDraft(fileNumber);
    if (submission === null) {
      throw new BaseServiceException('Failed to save/create draft');
    }
    return submission;
  }

  async publish(fileNumber: string, user: User) {
    const draft = await this.getDraft(fileNumber);
    if (!draft) {
      throw new BaseServiceException(
        `Failed to find Draft to Publish with File Number ${fileNumber}`,
      );
    }

    const original = await this.noticeOfIntentSubmissionRepository.findOne({
      where: {
        fileNumber,
        isDraft: false,
      },
      relations: {
        owners: true,
        parcels: true,
        createdBy: true,
      },
    });

    if (!original) {
      throw new BaseServiceException(
        `Failed to find original submission to Publish with FileID ${fileNumber}`,
      );
    }

    //Delete Original Submission
    for (const owner of original.owners) {
      await this.noticeOfIntentOwnerService.delete(owner, user);
    }
    const parcelUuids = original.parcels.map((parcel) => parcel.uuid);
    await this.noticeOfIntentParcelService.deleteMany(parcelUuids, user);
    await this.noticeOfIntentSubmissionStatusService.removeStatuses(
      original.uuid,
    );
    await this.noticeOfIntentSubmissionRepository.delete({
      uuid: original.uuid,
    });

    draft.createdBy = original.createdBy;
    draft.isDraft = false;
    await this.noticeOfIntentSubmissionRepository.save(draft);

    //Generate PDF
    //TODO: Turn this back on for PDFs
    // await this.generateSubmissionDocumentService.generateUpdate(
    //   fileNumber,
    //   user,
    // );
    this.logger.debug(`Published Draft for file number ${fileNumber}`);
  }

  async deleteDraft(fileNumber: string, user: User) {
    const draftSubmission =
      await this.noticeOfIntentSubmissionRepository.findOne({
        where: {
          fileNumber: fileNumber,
          isDraft: true,
        },
        relations: {
          createdBy: true,
          owners: {
            type: true,
          },
          parcels: {
            owners: true,
          },
        },
      });

    if (!draftSubmission) {
      throw new BadRequestException(
        "Cannot delete a submission that doesn't exist",
      );
    }

    for (const owner of draftSubmission.owners) {
      await this.noticeOfIntentOwnerService.delete(owner, user);
    }

    await this.noticeOfIntentSubmissionStatusService.removeStatuses(
      draftSubmission.uuid,
    );

    const parcelUuids = draftSubmission.parcels.map((parcel) => parcel.uuid);
    await this.noticeOfIntentParcelService.deleteMany(parcelUuids, user);

    await this.noticeOfIntentSubmissionRepository.remove(draftSubmission);
  }

  async mapToDetailedDto(
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    user: User,
  ) {
    const mappedSubmission =
      await this.noticeOfIntentSubmissionService.mapToDetailedDTO(
        noticeOfIntentSubmission,
        user,
      );
    return {
      ...mappedSubmission,
      canEdit: true,
      canReview: true,
      canView: true,
    };
  }
}
