import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { ApplicationParcelService } from '../application-parcel/application-parcel.service';
import { Application } from '../application.entity';
import { ApplicationOwnerType } from './application-owner-type/application-owner-type.entity';
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
    @InjectRepository(ApplicationOwnerType)
    private typeRepository: Repository<ApplicationOwnerType>,
    private documentService: DocumentService,
    @Inject(forwardRef(() => ApplicationParcelService))
    private applicationParcelService: ApplicationParcelService,
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

    return await this.repository.save(existingOwner);
  }

  async delete(uuid: string) {
    return await this.repository.delete({
      uuid,
    });
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
}
