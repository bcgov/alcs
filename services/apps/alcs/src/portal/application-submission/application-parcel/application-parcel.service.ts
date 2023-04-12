import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApplicationDocument } from '../../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { formatIncomingDate } from '../../../utils/incoming-date.formatter';
import { ApplicationOwnerService } from '../application-owner/application-owner.service';
import { ApplicationParcelUpdateDto } from './application-parcel.dto';
import { ApplicationParcel } from './application-parcel.entity';

@Injectable()
export class ApplicationParcelService {
  constructor(
    @InjectRepository(ApplicationParcel)
    private parcelRepository: Repository<ApplicationParcel>,
    @Inject(forwardRef(() => ApplicationOwnerService))
    private applicationOwnerService: ApplicationOwnerService,
  ) {}

  async fetchByApplicationFileId(fileId: string) {
    return this.parcelRepository.find({
      where: { application: { fileNumber: fileId } },
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

  async create(applicationFileNumber: string, parcelType?: string) {
    const parcel = new ApplicationParcel({
      applicationFileNumber,
      parcelType,
    });

    return this.parcelRepository.save(parcel);
  }

  async getOneOrFail(uuid: string) {
    return this.parcelRepository.findOneOrFail({
      where: { uuid },
    });
  }

  async setCertificateOfTitle(
    parcel: ApplicationParcel,
    certificateOfTitle: ApplicationDocument,
  ) {
    parcel.certificateOfTitle = certificateOfTitle;
    return await this.parcelRepository.save(parcel);
  }

  async update(updateDtos: ApplicationParcelUpdateDto[]) {
    const updatedParcels: ApplicationParcel[] = [];

    let hasOwnerUpdate = false;
    for (const updateDto of updateDtos) {
      const parcel = await this.getOneOrFail(updateDto.uuid);

      parcel.pid = updateDto.pid;
      parcel.pin = updateDto.pin;
      parcel.legalDescription = updateDto.legalDescription;
      parcel.mapAreaHectares = updateDto.mapAreaHectares;
      parcel.isFarm = updateDto.isFarm;
      parcel.purchasedDate = formatIncomingDate(updateDto.purchasedDate);
      parcel.ownershipTypeCode = updateDto.ownershipTypeCode;
      parcel.isConfirmedByApplicant = updateDto.isConfirmedByApplicant;
      parcel.crownLandOwnerType = updateDto.crownLandOwnerType;

      if (updateDto.ownerUuids) {
        hasOwnerUpdate = true;
        parcel.owners = await this.applicationOwnerService.getMany(
          updateDto.ownerUuids,
        );
      }

      updatedParcels.push(parcel);
    }

    const res = await this.parcelRepository.save(updatedParcels);

    if (hasOwnerUpdate) {
      const firstParcel = updatedParcels[0];
      await this.applicationOwnerService.updateApplicationApplicant(
        firstParcel.applicationFileNumber,
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
    await this.applicationOwnerService.updateApplicationApplicant(
      parcels[0].applicationFileNumber,
    );

    return result;
  }
}
