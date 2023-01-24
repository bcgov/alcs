import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { ApplicationParcelUpdateDto } from './application-parcel.dto';
import { ApplicationParcel } from './application-parcel.entity';

@Injectable()
export class ApplicationParcelService {
  constructor(
    @InjectRepository(ApplicationParcel)
    private parcelRepository: Repository<ApplicationParcel>,
  ) {}

  async fetchByApplicationFileId(fileId: string) {
    return this.parcelRepository.find({
      where: { application: { fileNumber: fileId } },
      order: { auditCreatedAt: 'ASC' },
      relations: { documents: { document: true } },
    });
  }

  async create(applicationFileId: string) {
    const parcel = new ApplicationParcel({
      applicationFileNumber: applicationFileId,
    });
    return this.parcelRepository.save(parcel);
  }

  async getOneOrFail(uuid: string) {
    return this.parcelRepository.findOneOrFail({
      where: { uuid },
    });
  }

  async update(uuid: string, updateDto: ApplicationParcelUpdateDto) {
    const parcel = await this.getOneOrFail(uuid);

    parcel.pid = updateDto.pid;
    parcel.pin = updateDto.pin;
    parcel.legalDescription = updateDto.legalDescription;
    parcel.mapAreaHectares = updateDto.mapAreaHectares;
    parcel.isFarm = updateDto.isFarm;
    parcel.purchasedDate = formatIncomingDate(updateDto.purchasedDate);
    parcel.ownershipTypeCode = updateDto.ownershipTypeCode;
    parcel.isConfirmedByApplicant = updateDto.isConfirmedByApplicant;

    return this.parcelRepository.save(parcel);
  }

  async delete(uuid: string) {
    const parcel = await this.getOneOrFail(uuid);
    await this.parcelRepository.remove([parcel]);
    return uuid;
  }
}
