import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionMaker } from './application-decision-maker/application-decision-maker.entity';
import { ApplicationStatus } from '../application-status/application-status.entity';
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
  ) {}

  async getAllCodes() {
    const values = await Promise.all([
      this.typeRepository.find(),
      this.statusRepository.find(),
      this.decisionMakerRepository.find(),
    ]);

    return {
      type: values[0],
      status: values[1],
      decisionMaker: values[2],
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
}
