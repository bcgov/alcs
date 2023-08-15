import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NoticeOfIntentDocument } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { formatIncomingDate } from '../../../utils/incoming-date.formatter';
import { filterUndefined } from '../../../utils/undefined';
import { NoticeOfIntentOwnerService } from '../notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelUpdateDto } from './notice-of-intent-parcel.dto';
import { NoticeOfIntentParcel } from './notice-of-intent-parcel.entity';

@Injectable()
export class NoticeOfIntentParcelService {
  constructor(
    @InjectRepository(NoticeOfIntentParcel)
    private parcelRepository: Repository<NoticeOfIntentParcel>,
    @Inject(forwardRef(() => NoticeOfIntentOwnerService))
    private noticeOfIntentOwnerService: NoticeOfIntentOwnerService,
  ) {}

  async fetchByApplicationFileId(fileId: string) {
    return this.parcelRepository.find({
      where: {
        noticeOfIntentSubmission: { fileNumber: fileId, isDraft: false },
      },
      order: { auditCreatedAt: 'ASC' },
      relations: {
        ownershipType: true,
        certificateOfTitle: { document: true },
        owners: {
          type: true,
          corporateSummary: {
            document: true,
          },
        },
      },
    });
  }

  async fetchByApplicationSubmissionUuid(uuid: string) {
    return this.parcelRepository.find({
      where: { noticeOfIntentSubmission: { uuid } },
      order: { auditCreatedAt: 'ASC' },
      relations: {
        ownershipType: true,
        certificateOfTitle: { document: true },
        owners: {
          type: true,
          corporateSummary: {
            document: true,
          },
        },
      },
    });
  }

  async create(noticeOfIntentSubmissionUuid: string) {
    const parcel = new NoticeOfIntentParcel({
      noticeOfIntentSubmissionUuid,
    });

    return this.parcelRepository.save(parcel);
  }

  async getOneOrFail(uuid: string) {
    return this.parcelRepository.findOneOrFail({
      where: { uuid },
    });
  }

  async setCertificateOfTitle(
    parcel: NoticeOfIntentParcel,
    certificateOfTitle: NoticeOfIntentDocument,
  ) {
    parcel.certificateOfTitle = certificateOfTitle;
    return await this.parcelRepository.save(parcel);
  }

  async update(updateDtos: NoticeOfIntentParcelUpdateDto[]) {
    const updatedParcels: NoticeOfIntentParcel[] = [];

    let hasOwnerUpdate = false;
    for (const updateDto of updateDtos) {
      const parcel = await this.getOneOrFail(updateDto.uuid);

      parcel.pid = updateDto.pid;
      parcel.pin = updateDto.pin;
      parcel.legalDescription = updateDto.legalDescription;
      parcel.mapAreaHectares = updateDto.mapAreaHectares;
      parcel.civicAddress = updateDto.civicAddress;
      parcel.isFarm = updateDto.isFarm;
      parcel.purchasedDate = formatIncomingDate(updateDto.purchasedDate);
      parcel.ownershipTypeCode = updateDto.ownershipTypeCode;
      parcel.isConfirmedByApplicant = filterUndefined(
        updateDto.isConfirmedByApplicant,
        parcel.isConfirmedByApplicant,
      );
      parcel.crownLandOwnerType = updateDto.crownLandOwnerType;
      parcel.alrArea = updateDto.alrArea;

      if (updateDto.ownerUuids) {
        hasOwnerUpdate = true;
        parcel.owners = await this.noticeOfIntentOwnerService.getMany(
          updateDto.ownerUuids,
        );
      }

      updatedParcels.push(parcel);
    }

    const res = await this.parcelRepository.save(updatedParcels);

    if (hasOwnerUpdate) {
      const firstParcel = updatedParcels[0];
      await this.noticeOfIntentOwnerService.updateSubmissionApplicant(
        firstParcel.noticeOfIntentSubmissionUuid,
      );
    }
    return res;
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

    const result = await this.parcelRepository.remove(parcels);
    await this.noticeOfIntentOwnerService.updateSubmissionApplicant(
      parcels[0].noticeOfIntentSubmissionUuid,
    );

    return result;
  }
}
