import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { NoticeOfIntentDocumentService } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentService } from '../../../alcs/notice-of-intent/notice-of-intent.service';
import {
  OWNER_TYPE,
  OwnerType,
} from '../../../common/owner-type/owner-type.entity';
import { User } from '../../../user/user.entity';
import { FALLBACK_APPLICANT_NAME } from '../../../utils/owner.constants';
import { NoticeOfIntentParcelService } from '../notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission.service';
import {
  NoticeOfIntentOwnerCreateDto,
  NoticeOfIntentOwnerUpdateDto,
} from './notice-of-intent-owner.dto';
import { NoticeOfIntentOwner } from './notice-of-intent-owner.entity';

@Injectable()
export class NoticeOfIntentOwnerService {
  constructor(
    @InjectRepository(NoticeOfIntentOwner)
    private repository: Repository<NoticeOfIntentOwner>,
    @InjectRepository(OwnerType)
    private typeRepository: Repository<OwnerType>,
    @Inject(forwardRef(() => NoticeOfIntentParcelService))
    private noticeOfIntentParcelService: NoticeOfIntentParcelService,
    @Inject(forwardRef(() => NoticeOfIntentSubmissionService))
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private noticeOfIntentService: NoticeOfIntentService,
  ) {}

  async fetchByApplicationFileId(fileId: string) {
    return this.repository.find({
      where: {
        noticeOfIntentSubmission: {
          fileNumber: fileId,
        },
      },
      relations: {
        type: true,
        corporateSummary: {
          document: true,
        },
      },
    });
  }

  async create(
    createDto: NoticeOfIntentOwnerCreateDto,
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    user: User,
  ) {
    const type = await this.typeRepository.findOneOrFail({
      where: {
        code: createDto.typeCode,
      },
    });

    const newOwner = new NoticeOfIntentOwner({
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      organizationName: createDto.organizationName,
      email: createDto.email,
      phoneNumber: createDto.phoneNumber,
      corporateSummaryUuid: createDto.corporateSummaryUuid,
      noticeOfIntentSubmission,
      crownLandOwnerType: createDto.crownLandOwnerType,
      type,
    });

    const savedOwner = await this.repository.save(newOwner);

    await this.updateSubmissionApplicant(
      savedOwner.noticeOfIntentSubmissionUuid,
      user,
    );

    return savedOwner;
  }

  async attachToParcel(uuid: string, parcelUuid: string, user: User) {
    const existingOwner = await this.repository.findOneOrFail({
      where: {
        uuid,
      },
      relations: {
        parcels: true,
      },
    });

    const parcel = await this.noticeOfIntentParcelService.getOneOrFail(
      parcelUuid,
    );
    existingOwner.parcels.push(parcel);

    await this.repository.save(existingOwner);

    await this.updateSubmissionApplicant(
      existingOwner.noticeOfIntentSubmissionUuid,
      user,
    );
  }

  async save(owner: NoticeOfIntentOwner) {
    await this.repository.save(owner);
  }

  async removeFromParcel(uuid: string, parcelUuid: string, user: User) {
    const existingOwner = await this.repository.findOneOrFail({
      where: {
        uuid,
      },
      relations: {
        parcels: true,
      },
    });

    existingOwner.parcels = existingOwner.parcels.filter(
      (parcel) => parcel.uuid !== parcelUuid,
    );
    await this.repository.save(existingOwner);

    await this.updateSubmissionApplicant(
      existingOwner.noticeOfIntentSubmissionUuid,
      user,
    );
  }

  async update(
    uuid: string,
    updateDto: NoticeOfIntentOwnerUpdateDto,
    user: User,
  ) {
    const existingOwner = await this.repository.findOneOrFail({
      where: {
        uuid,
      },
      relations: {
        corporateSummary: {
          document: true,
        },
      },
    });

    if (updateDto.typeCode) {
      existingOwner.type = await this.typeRepository.findOneOrFail({
        where: {
          code: updateDto.typeCode,
        },
      });
    }

    //If attaching new document and old one was defined, delete it
    if (
      existingOwner.corporateSummaryUuid !== updateDto.corporateSummaryUuid &&
      existingOwner.corporateSummary
    ) {
      const oldSummary = existingOwner.corporateSummary;
      existingOwner.corporateSummary = null;
      await this.repository.save(existingOwner);
      await this.noticeOfIntentDocumentService.delete(oldSummary);
    }

    existingOwner.corporateSummaryUuid =
      updateDto.corporateSummaryUuid !== undefined
        ? updateDto.corporateSummaryUuid
        : existingOwner.corporateSummaryUuid;

    existingOwner.organizationName =
      updateDto.organizationName !== undefined
        ? updateDto.organizationName
        : existingOwner.organizationName;

    existingOwner.firstName =
      updateDto.firstName !== undefined
        ? updateDto.firstName
        : existingOwner.firstName;

    existingOwner.lastName =
      updateDto.lastName !== undefined
        ? updateDto.lastName
        : existingOwner.lastName;

    existingOwner.phoneNumber =
      updateDto.phoneNumber !== undefined
        ? updateDto.phoneNumber
        : existingOwner.phoneNumber;

    existingOwner.email =
      updateDto.email !== undefined ? updateDto.email : existingOwner.email;

    existingOwner.crownLandOwnerType = 
      updateDto.crownLandOwnerType !== undefined ? updateDto.crownLandOwnerType : existingOwner.crownLandOwnerType;

    const savedOwner = await this.repository.save(existingOwner);

    await this.updateSubmissionApplicant(
      existingOwner.noticeOfIntentSubmissionUuid,
      user,
    );

    return savedOwner;
  }

  async delete(owner: NoticeOfIntentOwner, user: User) {
    const res = await this.repository.remove(owner);
    await this.updateSubmissionApplicant(
      owner.noticeOfIntentSubmissionUuid,
      user,
    );
    return res;
  }

  async setPrimaryContact(
    submissionUuid: string,
    owner: NoticeOfIntentOwner,
    user: User,
  ) {
    await this.noticeOfIntentSubmissionService.setPrimaryContact(
      submissionUuid,
      owner.uuid,
      user,
    );
  }

  async getOwner(ownerUuid: string) {
    return await this.repository.findOneOrFail({
      where: {
        uuid: ownerUuid,
      },
      relations: {
        type: true,
        corporateSummary: {
          document: true,
        },
      },
    });
  }

  async getMany(ownerUuids: string[]) {
    return await this.repository.find({
      where: {
        uuid: Any(ownerUuids),
      },
    });
  }

  async deleteNonParcelOwners(submissionUuid: string) {
    const agentOwners = await this.repository.find({
      where: [
        {
          noticeOfIntentSubmission: {
            uuid: submissionUuid,
          },
          type: {
            code: OWNER_TYPE.AGENT,
          },
        },
        {
          noticeOfIntentSubmission: {
            uuid: submissionUuid,
          },
          type: {
            code: OWNER_TYPE.GOVERNMENT,
          },
        },
      ],
    });
    return await this.repository.remove(agentOwners);
  }

  async updateSubmissionApplicant(submissionUuid: string, user: User) {
    const parcels =
      await this.noticeOfIntentParcelService.fetchByApplicationSubmissionUuid(
        submissionUuid,
      );

    if (parcels.length > 0) {
      const firstParcel = parcels.reduce((a, b) =>
        a.auditCreatedAt < b.auditCreatedAt ? a : b,
      );

      const ownerCount = parcels.reduce((count, parcel) => {
        return count + parcel.owners.length;
      }, 0);

      if (firstParcel) {
        //Filter to only alphabetic
        const alphabetOwners = firstParcel.owners.filter((owner) =>
          isNaN(
            parseInt(
              (owner.organizationName ?? owner.lastName ?? '').charAt(0),
            ),
          ),
        );

        //If no alphabetic use them all
        if (alphabetOwners.length === 0) {
          alphabetOwners.push(...firstParcel.owners);
        }

        const firstOwner = alphabetOwners.sort((a, b) => {
          const mappedA = a.organizationName ?? a.lastName ?? '';
          const mappedB = b.organizationName ?? b.lastName ?? '';
          return mappedA.localeCompare(mappedB);
        })[0];
        if (firstOwner) {
          let applicantName = firstOwner.organizationName
            ? firstOwner.organizationName
            : firstOwner.lastName;
          if (ownerCount > 1) {
            applicantName += ' et al.';
          }

          await this.noticeOfIntentSubmissionService.update(
            submissionUuid,
            {
              applicant: applicantName || '',
            },
            user,
          );

          const fileNumber =
            await this.noticeOfIntentSubmissionService.getFileNumber(
              submissionUuid,
            );
          if (fileNumber) {
            await this.noticeOfIntentService.updateApplicant(
              fileNumber,
              applicantName || FALLBACK_APPLICANT_NAME,
            );
          }
        }
      }
    }
  }
}
