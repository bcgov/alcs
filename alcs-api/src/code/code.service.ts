import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { ApplicationReconsiderationType } from '../application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { CardStatus } from '../card/card-status/card-status.entity';
import { BaseCodeEntity } from '../common/entities/base.code.entity';
import { ApplicationMeetingType } from './application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationRegion } from './application-code/application-region/application-region.entity';
import { ApplicationType } from './application-code/application-type/application-type.entity';

@Injectable()
export class CodeService {
  constructor(
    @InjectRepository(ApplicationType)
    private typeRepository: Repository<ApplicationType>,
    @InjectRepository(CardStatus)
    private statusRepository: Repository<CardStatus>,
    @InjectRepository(ApplicationRegion)
    private regionRepository: Repository<ApplicationRegion>,
    @InjectRepository(ApplicationMeetingType)
    private meetingTypesRepository: Repository<ApplicationMeetingType>,
    @InjectRepository(ApplicationReconsiderationType)
    private reconsiderationTypesRepository: Repository<ApplicationReconsiderationType>,
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
      this.reconsiderationTypesRepository.find(alphabeticalFindOptions),
    ]);

    return {
      type: values[0],
      status: values[1],
      region: values[2],
      meetingTypes: values[3],
      reconsiderationTypes: values[4],
    };
  }

  async fetchApplicationType(code: string): Promise<ApplicationType> {
    return this.typeRepository.findOne({
      where: {
        code,
      },
    });
  }

  async fetchCardStatus(code: string): Promise<CardStatus> {
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
