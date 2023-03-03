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

  async fetchByPid(pid: string) {
    pid = pid.replace(/-/g, '');
    const paddedPin = pid.padStart(9, '0');
    return this.parcelLookupRepository.findOne({
      where: [{ pid: pid }, { pid: paddedPin }],
    });
  }

  async fetchByPin(pin: string) {
    return this.parcelLookupRepository.findOne({
      where: [{ pin }],
    });
  }
}
