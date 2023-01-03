import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParcelLookup } from './parcel-lookup.entity';

@Injectable()
export class ParcelService {
  constructor(
    @InjectRepository(ParcelLookup)
    private parcelLookupRepository: Repository<ParcelLookup>,
  ) {}

  async fetchByPidPin(pidPin: string) {
    if (pidPin === '0') {
      return null;
    }

    return await this.parcelLookupRepository.findOne({
      where: [{ pidNumber: pidPin }, { pin: pidPin }],
    });
  }
}
