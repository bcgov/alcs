import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';
import { ApplicationStatus } from '../application-status/application-status.entity';
import { ApplicationMeetingType } from './application-meeting-type/application-meeting-type.entity';
import { ApplicationRegion } from './application-region/application-region.entity';
import { ApplicationType } from './application-type/application-type.entity';

@Injectable()
export class ApplicationCodeService {
  constructor(
    @InjectRepository(ApplicationType)
    private typeRepository: Repository<ApplicationType>,
    @InjectRepository(ApplicationStatus)
    private statusRepository: Repository<ApplicationStatus>,
    @InjectRepository(ApplicationRegion)
    private regionRepository: Repository<ApplicationRegion>,
    @InjectRepository(ApplicationMeetingType)
    private meetingTypesRepository: Repository<ApplicationMeetingType>,
  ) {}

  async getAll() {
    const alphabeticalSort: FindOptionsOrder<BaseCodeEntity> = {
      label: 'ASC',
    };
    const alphabeticalFindOptions = {
      order: alphabeticalSort,
    };
    const values = await Promise.all([
      this.typeRepository.find(alphabeticalFindOptions),
      this.statusRepository.find(), //Status is not alphabetical
      this.regionRepository.find(alphabeticalFindOptions),
      this.meetingTypesRepository.find(alphabeticalFindOptions),
    ]);

    return {
      type: values[0],
      status: values[1],
      region: values[2],
      meetingTypes: values[3],
    };
  }

  async fetchType(code: string): Promise<ApplicationType> {
    return this.typeRepository.findOne({
      where: {
        code,
      },
    });
  }

  async fetchStatus(code: string): Promise<ApplicationStatus> {
    return this.statusRepository.findOne({
      where: {
        code,
      },
    });
  }

  async fetchRegion(code: string): Promise<ApplicationRegion> {
    return this.regionRepository.findOne({
      where: {
        code,
      },
    });
  }

  async fetchMeetingType(code: string): Promise<ApplicationRegion> {
    return this.meetingTypesRepository.findOne({
      where: {
        code,
      },
    });
  }
}
