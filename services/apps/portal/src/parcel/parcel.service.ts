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
    pidPin = pidPin.replace(/-/g, '');
    const paddedPin = pidPin.padStart(9, '0');
    return this.parcelLookupRepository.findOne({
      where: [{ pid: pidPin }, { pin: pidPin }, { pid: paddedPin }],
    });
  }
}
