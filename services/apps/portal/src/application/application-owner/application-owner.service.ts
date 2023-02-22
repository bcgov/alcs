import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { PARCEL_TYPE } from '../application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../application-parcel/application-parcel.service';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationOwnerType } from './application-owner-type/application-owner-type.entity';
import {
  APPLICATION_OWNER,
  ApplicationOwnerCreateDto,
  ApplicationOwnerUpdateDto,
} from './application-owner.dto';
import { ApplicationOwner } from './application-owner.entity';

@Injectable()
export class ApplicationOwnerService {
  constructor(
    @InjectRepository(ApplicationOwner)
    private repository: Repository<ApplicationOwner>,
    @InjectRepository(ApplicationOwnerType)
    private typeRepository: Repository<ApplicationOwnerType>,
    private documentService: DocumentService,
    @Inject(forwardRef(() => ApplicationParcelService))
    private applicationParcelService: ApplicationParcelService,
    private applicationService: ApplicationService,
  ) {}

  async fetchByApplicationFileId(fileId: string) {
    return this.repository.find({
      where: {
        application: {
          fileNumber: fileId,
        },
      },
      relations: {
        type: true,
      },
    });
  }

  async create(createDto: ApplicationOwnerCreateDto, application: Application) {
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
      application,
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

    await this.updateApplicationApplicant(existingOwner.applicationFileNumber);

    await this.repository.save(existingOwner);
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

    await this.updateApplicationApplicant(existingOwner.applicationFileNumber);

    await this.repository.save(existingOwner);
  }

  async update(uuid: string, updateDto: ApplicationOwnerUpdateDto) {
    const existingOwner = await this.repository.findOneOrFail({
      where: {
        uuid,
      },
      relations: {
        corporateSummary: true,
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
      await this.documentService.delete(oldSummary);
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

    await this.updateApplicationApplicant(existingOwner.applicationFileNumber);

    return await this.repository.save(existingOwner);
  }

  async delete(owner: ApplicationOwner) {
    const res = await this.repository.remove(owner);
    await this.updateApplicationApplicant(owner.applicationFileNumber);
    return res;
  }

  async setPrimaryContact(fileNumber: string, owner: ApplicationOwner) {
    return await this.applicationService.setPrimaryContact(
      fileNumber,
      owner.uuid,
    );
  }

  async getByOwner(user: User, ownerUuid: string) {
    return await this.repository.findOneOrFail({
      where: {
        application: {
          createdBy: {
            uuid: user.uuid,
          },
        },
        uuid: ownerUuid,
      },
      relations: {
        type: true,
        corporateSummary: true,
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

  async deleteAgents(application: Application) {
    const agentOwners = await this.repository.find({
      where: {
        application: {
          fileNumber: application.fileNumber,
        },
        type: {
          code: APPLICATION_OWNER.AGENT,
        },
      },
    });
    return await this.repository.remove(agentOwners);
  }

  async updateApplicationApplicant(fileId: string) {
    const parcels =
      await this.applicationParcelService.fetchByApplicationFileId(fileId);

    const firstParcel = parcels
      .filter((parcel) => parcel.parcelType === PARCEL_TYPE.APPLICATION)
      .reduce((a, b) => (a.auditCreatedAt > b.auditCreatedAt ? a : b));

    const ownerCount = parcels.reduce((count, parcel) => {
      return count + parcel.owners.length;
    }, 0);

    if (firstParcel) {
      const firstOwner = firstParcel.owners.sort((a, b) => {
        const mappedA = a.organizationName ?? a.firstName ?? '';
        const mappedB = b.organizationName ?? b.firstName ?? '';
        return mappedA > mappedB ? 1 : -1;
      })[0];
      if (firstOwner) {
        let applicantName = firstOwner.organizationName
          ? firstOwner.organizationName
          : `${firstOwner.firstName} ${firstOwner.lastName}`;
        if (ownerCount > 1) {
          applicantName += ' et al.';
        }

        await this.applicationService.update(fileId, {
          applicant: applicantName || '',
        });
      }
    }
  }
}
