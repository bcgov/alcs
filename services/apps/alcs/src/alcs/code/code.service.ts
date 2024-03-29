import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { ApplicationDecisionMakerCode } from '../application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationSubmissionStatusType } from '../application/application-submission-status/submission-status-type.entity';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';
import { ApplicationReconsiderationType } from '../application-decision/application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { CardStatus } from '../card/card-status/card-status.entity';
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
    @InjectRepository(ApplicationSubmissionStatusType)
    private applicationStatusRepository: Repository<ApplicationSubmissionStatusType>,
    @InjectRepository(ApplicationDecisionMakerCode)
    private applicationDecisionMakerCodeRepository: Repository<ApplicationDecisionMakerCode>,
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
      this.applicationStatusRepository.find(alphabeticalFindOptions),
      this.applicationDecisionMakerCodeRepository.find(alphabeticalFindOptions),
    ]);

    return {
      type: values[0],
      status: values[1],
      region: values[2],
      meetingTypes: values[3],
      reconsiderationTypes: values[4],
      applicationStatusTypes: values[5],
      decisionMakers: values[6],
    };
  }

  async fetchApplicationType(code: string): Promise<ApplicationType> {
    return this.typeRepository.findOneOrFail({
      where: {
        code,
      },
    });
  }

  async fetchCardStatus(code: string): Promise<CardStatus> {
    return this.statusRepository.findOneOrFail({
      where: {
        code,
      },
    });
  }

  async fetchRegion(code: string): Promise<ApplicationRegion> {
    return this.regionRepository.findOneOrFail({
      where: {
        code,
      },
    });
  }

  async fetchMeetingType(code: string): Promise<ApplicationMeetingType> {
    return this.meetingTypesRepository.findOneOrFail({
      where: {
        code,
      },
    });
  }
}
