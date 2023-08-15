import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { NoticeOfIntentDocumentService } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import {
  OWNER_TYPE,
  OwnerType,
} from '../../../common/owner-type/owner-type.entity';
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
      type,
    });

    return await this.repository.save(newOwner);
  }

  async attachToParcel(uuid: string, parcelUuid: string) {
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

    await this.updateSubmissionApplicant(
      existingOwner.noticeOfIntentSubmissionUuid,
    );

    await this.repository.save(existingOwner);
  }

  async save(owner: NoticeOfIntentOwner) {
    await this.repository.save(owner);
  }

  async removeFromParcel(uuid: string, parcelUuid: string) {
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

    await this.updateSubmissionApplicant(
      existingOwner.noticeOfIntentSubmissionUuid,
    );

    await this.repository.save(existingOwner);
  }

  async update(uuid: string, updateDto: NoticeOfIntentOwnerUpdateDto) {
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

    await this.updateSubmissionApplicant(
      existingOwner.noticeOfIntentSubmissionUuid,
    );

    return await this.repository.save(existingOwner);
  }

  async delete(owner: NoticeOfIntentOwner) {
    const res = await this.repository.remove(owner);
    await this.updateSubmissionApplicant(owner.noticeOfIntentSubmissionUuid);
    return res;
  }

  async setPrimaryContact(submissionUuid: string, owner: NoticeOfIntentOwner) {
    await this.noticeOfIntentSubmissionService.setPrimaryContact(
      submissionUuid,
      owner.uuid,
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

  async updateSubmissionApplicant(submissionUuid: string) {
    const parcels =
      await this.noticeOfIntentParcelService.fetchByApplicationSubmissionUuid(
        submissionUuid,
      );

    if (parcels.length > 0) {
      const firstParcel = parcels.reduce((a, b) =>
        a.auditCreatedAt > b.auditCreatedAt ? a : b,
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

          await this.noticeOfIntentSubmissionService.update(submissionUuid, {
            applicant: applicantName || '',
          });
        }
      }
    }
  }
}
