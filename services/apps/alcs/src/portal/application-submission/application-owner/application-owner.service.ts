import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../../alcs/application/application.service';
import {
  OWNER_TYPE,
  OwnerType,
} from '../../../common/owner-type/owner-type.entity';
import { FALLBACK_APPLICANT_NAME } from '../../../utils/owner.constants';
import { PARCEL_TYPE } from '../application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission.service';
import {
  ApplicationOwnerCreateDto,
  ApplicationOwnerUpdateDto,
} from './application-owner.dto';
import { ApplicationOwner } from './application-owner.entity';

@Injectable()
export class ApplicationOwnerService {
  constructor(
    @InjectRepository(ApplicationOwner)
    private repository: Repository<ApplicationOwner>,
    @InjectRepository(OwnerType)
    private typeRepository: Repository<OwnerType>,
    @Inject(forwardRef(() => ApplicationParcelService))
    private applicationParcelService: ApplicationParcelService,
    @Inject(forwardRef(() => ApplicationSubmissionService))
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService,
    private applicationService: ApplicationService,
  ) {}

  async fetchByApplicationFileId(fileId: string) {
    return this.repository.find({
      where: {
        applicationSubmission: {
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
    createDto: ApplicationOwnerCreateDto,
    applicationSubmission: ApplicationSubmission,
  ) {
    const type = await this.typeRepository.findOneOrFail({
      where: {
        code: createDto.typeCode,
      },
    });

    const newOwner = new ApplicationOwner({
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      organizationName: createDto.organizationName,
      email: createDto.email,
      phoneNumber: createDto.phoneNumber,
      corporateSummaryUuid: createDto.corporateSummaryUuid,
      applicationSubmission: applicationSubmission,
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

    const parcel = await this.applicationParcelService.getOneOrFail(parcelUuid);
    existingOwner.parcels.push(parcel);

    await this.repository.save(existingOwner);

    await this.updateSubmissionApplicant(
      existingOwner.applicationSubmissionUuid,
    );
  }

  async save(owner: ApplicationOwner) {
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

    await this.repository.save(existingOwner);

    await this.updateSubmissionApplicant(
      existingOwner.applicationSubmissionUuid,
    );
  }

  async update(uuid: string, updateDto: ApplicationOwnerUpdateDto) {
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
      await this.applicationDocumentService.delete(oldSummary);
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

    const result = await this.repository.save(existingOwner);

    //Save owner before updating
    await this.updateSubmissionApplicant(
      existingOwner.applicationSubmissionUuid,
    );

    return result;
  }

  async delete(owner: ApplicationOwner) {
    const res = await this.repository.remove(owner);
    await this.updateSubmissionApplicant(owner.applicationSubmissionUuid);
    return res;
  }

  async setPrimaryContact(submissionUuid: string, owner: ApplicationOwner) {
    await this.applicationSubmissionService.setPrimaryContact(
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
          applicationSubmission: {
            uuid: submissionUuid,
          },
          type: {
            code: OWNER_TYPE.AGENT,
          },
        },
        {
          applicationSubmission: {
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
      await this.applicationParcelService.fetchByApplicationSubmissionUuid(
        submissionUuid,
      );

    const applicationParcels = parcels.filter(
      (parcel) => parcel.parcelType === PARCEL_TYPE.APPLICATION,
    );

    if (applicationParcels.length > 0) {
      const firstParcel = parcels
        .filter((parcel) => parcel.parcelType === PARCEL_TYPE.APPLICATION)
        .reduce((a, b) => (a.auditCreatedAt < b.auditCreatedAt ? a : b));

      const ownerCount = applicationParcels.reduce((count, parcel) => {
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

          await this.applicationSubmissionService.update(submissionUuid, {
            applicant: applicantName || '',
          });

          const fileNumber =
            await this.applicationSubmissionService.getFileNumber(
              submissionUuid,
            );
          if (fileNumber) {
            await this.applicationService.updateApplicant(
              fileNumber,
              applicantName || FALLBACK_APPLICANT_NAME,
            );
          }
        }
      }
    }
  }
}
