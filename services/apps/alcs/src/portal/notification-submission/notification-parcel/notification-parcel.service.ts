import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationParcelUpdateDto } from './notification-parcel.dto';
import { NotificationParcel } from './notification-parcel.entity';

@Injectable()
export class NotificationParcelService {
  constructor(
    @InjectRepository(NotificationParcel)
    private parcelRepository: Repository<NotificationParcel>,
  ) {}

  async fetchByFileId(fileId: string) {
    return this.parcelRepository.find({
      where: {
        notificationSubmission: { fileNumber: fileId },
      },
      order: { auditCreatedAt: 'ASC' },
    });
  }

  async fetchBySubmissionUuid(uuid: string) {
    return this.parcelRepository.find({
      where: { notificationSubmissionUuid: uuid },
      order: { auditCreatedAt: 'ASC' },
      relations: {
        ownershipType: true,
      },
    });
  }

  async create(notificationSubmissionUuid: string) {
    const parcel = new NotificationParcel({
      notificationSubmissionUuid,
    });

    return this.parcelRepository.save(parcel);
  }

  async getOneOrFail(uuid: string) {
    return this.parcelRepository.findOneOrFail({
      where: { uuid },
    });
  }

  async update(updateDtos: NotificationParcelUpdateDto[]) {
    const updatedParcels: NotificationParcel[] = [];

    for (const updateDto of updateDtos) {
      const parcel = await this.getOneOrFail(updateDto.uuid);

      parcel.pid = updateDto.pid;
      parcel.pin = updateDto.pin;
      parcel.legalDescription = updateDto.legalDescription;
      parcel.mapAreaHectares = updateDto.mapAreaHectares;
      parcel.civicAddress = updateDto.civicAddress;
      parcel.ownershipTypeCode = updateDto.ownershipTypeCode;

      updatedParcels.push(parcel);
    }

    return await this.parcelRepository.save(updatedParcels);
  }

  async deleteMany(uuids: string[]) {
    const parcels = await this.parcelRepository.find({
      where: { uuid: In(uuids) },
    });

    if (parcels.length === 0) {
      throw new ServiceValidationException(
        `Unable to find parcels with provided uuids: ${uuids}.`,
      );
    }

    return await this.parcelRepository.remove(parcels);
  }
}
