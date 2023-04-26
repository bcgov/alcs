import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { ApplicationOwnerService } from '../application-submission/application-owner/application-owner.service';
import { ApplicationParcelUpdateDto } from '../application-submission/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../application-submission/application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { GenerateSubmissionDocumentService } from '../pdf-generation/generate-submission-document.service';

@Injectable()
export class ApplicationSubmissionDraftService {
  private logger = new Logger(ApplicationSubmissionDraftService.name);

  constructor(
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationParcelService: ApplicationParcelService,
    private applicationOwnerService: ApplicationOwnerService,
    private generateSubmissionDocumentService: GenerateSubmissionDocumentService,
  ) {}

  async getOrCreateDraft(fileNumber: string) {
    const existingDraft = await this.getDraft(fileNumber);

    if (existingDraft) {
      return existingDraft;
    } else {
      return this.createDraft(fileNumber);
    }
  }

  private async getDraft(fileNumber: string) {
    return await this.applicationSubmissionRepository.findOne({
      where: {
        fileNumber: fileNumber,
        isDraft: true,
      },
      relations: {
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
  ): Promise<ApplicationSubmission> {
    const originalSubmission =
      await this.applicationSubmissionRepository.findOne({
        where: {
          fileNumber: fileNumber,
          isDraft: false,
        },
        relations: {
          status: true,
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

    const newReview = new ApplicationSubmission({
      ...originalSubmission,
      uuid: undefined,
      auditCreatedAt: undefined,
      auditUpdatedAt: undefined,
      isDraft: true,
      parcels: [],
      owners: [],
    });
    const savedSubmission = await this.applicationSubmissionRepository.save(
      newReview,
    );

    const ownerUuidMap = new Map<string, string>();
    for (const owner of originalSubmission.owners) {
      const savedOwner = await this.applicationOwnerService.create(
        {
          firstName: owner.firstName ?? undefined,
          lastName: owner.lastName ?? undefined,
          typeCode: owner.type.code ?? undefined,
          corporateSummaryUuid: owner.corporateSummaryUuid ?? undefined,
          email: owner.email ?? undefined,
          phoneNumber: owner.phoneNumber ?? undefined,
          organizationName: owner.organizationName ?? undefined,
          applicationSubmissionUuid: savedSubmission.uuid,
        },
        savedSubmission,
      );
      ownerUuidMap.set(owner.uuid, savedOwner.uuid);
    }

    const updateDtos: ApplicationParcelUpdateDto[] = [];
    for (const parcel of originalSubmission.parcels) {
      const savedParcel = await this.applicationParcelService.create(
        savedSubmission.uuid,
        parcel.parcelType,
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
        await this.applicationParcelService.setCertificateOfTitle(
          savedParcel,
          parcel.certificateOfTitle,
        );
      }
    }
    await this.applicationParcelService.update(updateDtos);

    //Copy over Primary Contact
    if (originalSubmission.primaryContactOwnerUuid) {
      const mappedOwnerUuid = (savedSubmission.primaryContactOwnerUuid =
        ownerUuidMap.get(originalSubmission.primaryContactOwnerUuid));
      await this.applicationSubmissionRepository.update(
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

    const original = await this.applicationSubmissionRepository.findOne({
      where: {
        fileNumber,
        isDraft: false,
      },
      relations: {
        owners: true,
        parcels: true,
      },
    });

    if (!original) {
      throw new BaseServiceException(
        `Failed to find original submission to Publish with FileID ${fileNumber}`,
      );
    }

    //Delete Original Submission
    for (const owner of original.owners) {
      await this.applicationOwnerService.delete(owner);
    }
    const parcelUuids = original.parcels.map((parcel) => parcel.uuid);
    await this.applicationParcelService.deleteMany(parcelUuids);
    await this.applicationSubmissionRepository.remove(original);

    draft.isDraft = false;
    await this.applicationSubmissionRepository.save(draft);

    //Generate PDF
    await this.generateSubmissionDocumentService.generateUpdate(
      fileNumber,
      user,
    );
    this.logger.debug(`Published Draft for file number ${fileNumber}`);
  }

  async deleteDraft(fileNumber: string) {
    const draftSubmission = await this.applicationSubmissionRepository.findOne({
      where: {
        fileNumber: fileNumber,
        isDraft: true,
      },
      relations: {
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
      await this.applicationOwnerService.delete(owner);
    }

    const parcelUuids = draftSubmission.parcels.map((parcel) => parcel.uuid);
    await this.applicationParcelService.deleteMany(parcelUuids);

    await this.applicationSubmissionRepository.remove(draftSubmission);
  }

  async mapToDetailedDto(applicationSubmission: ApplicationSubmission) {
    const mappedSubmission =
      await this.applicationSubmissionService.mapToDetailedDTO(
        applicationSubmission,
      );
    return {
      ...mappedSubmission,
      canEdit: true,
      canReview: true,
      canView: true,
    };
  }
}
