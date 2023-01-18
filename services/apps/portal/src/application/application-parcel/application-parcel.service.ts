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
    });
  }

  async create(applicationFileId: string) {
    const parcel = new ApplicationParcel({
      applicationFileNumber: applicationFileId,
    });
    return this.parcelRepository.save(parcel);
  }

  async update(uuid: string, updateDto: ApplicationParcelUpdateDto) {
    const parcel = await this.parcelRepository.findOneOrFail({
      where: { uuid },
    });

    parcel.pid = updateDto.pid;
    parcel.pin = updateDto.pin;
    parcel.legalDescription = updateDto.legalDescription;
    parcel.mapAreaHectares = updateDto.mapAreaHectares;
    parcel.isFarm = updateDto.isFarm;
    parcel.purchasedDate = formatIncomingDate(updateDto.purchasedDate);
    parcel.ownershipTypeCode = updateDto.ownershipTypeCode;

    return this.parcelRepository.save(parcel);
  }
}
