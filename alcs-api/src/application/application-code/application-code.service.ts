import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';
import { ApplicationDecisionMaker } from './application-decision-maker/application-decision-maker.entity';
import { ApplicationStatus } from '../application-status/application-status.entity';
import { ApplicationRegion } from './application-region/application-region.entity';
import { ApplicationType } from './application-type/application-type.entity';

@Injectable()
export class ApplicationCodeService {
  constructor(
    @InjectRepository(ApplicationType)
    private typeRepository: Repository<ApplicationType>,
    @InjectRepository(ApplicationStatus)
    private statusRepository: Repository<ApplicationStatus>,
    @InjectRepository(ApplicationDecisionMaker)
    private decisionMakerRepository: Repository<ApplicationDecisionMaker>,
    @InjectRepository(ApplicationRegion)
    private regionRepository: Repository<ApplicationRegion>,
  ) {}

  async getAllCodes() {
    const alphabeticalSort: FindOptionsOrder<BaseCodeEntity> = {
      label: 'ASC',
    };
    const alphabeticalFindOptions = {
      order: alphabeticalSort,
    };
    const values = await Promise.all([
      this.typeRepository.find(alphabeticalFindOptions),
      this.statusRepository.find(), //Status is not alphabetical
      this.decisionMakerRepository.find(alphabeticalFindOptions),
      this.regionRepository.find(alphabeticalFindOptions),
    ]);

    return {
      type: values[0],
      status: values[1],
      decisionMaker: values[2],
      region: values[3],
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

  async fetchDecisionMaker(code: string): Promise<ApplicationDecisionMaker> {
    return this.decisionMakerRepository.findOne({
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
}
