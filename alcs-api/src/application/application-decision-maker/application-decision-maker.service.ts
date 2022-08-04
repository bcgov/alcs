import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionMaker } from './application-decision-maker.entity';

@Injectable()
export class ApplicationDecisionMakerService {
  constructor(
    @InjectRepository(ApplicationDecisionMaker)
    private readonly applicationTypeRepository: Repository<ApplicationDecisionMaker>,
  ) {}

  async getAll(): Promise<ApplicationDecisionMaker[]> {
    return this.applicationTypeRepository.find();
  }

  async get(code: string): Promise<ApplicationDecisionMaker> {
    return this.applicationTypeRepository.findOne({
      where: {
        code,
      },
    });
  }
}
