import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecision } from './application-decision.entity';

@Injectable()
export class ApplicationDecisionService {
  constructor(
    @InjectRepository(ApplicationDecision)
    private appDecisionRepository: Repository<ApplicationDecision>,
    private applicationService: ApplicationService,
  ) {}

  async getByAppFileNumber(number: string) {
    const application = await this.applicationService.get(number);

    if (!application) {
      throw new ServiceNotFoundException(
        `Application with provided number not found ${number}`,
      );
    }

    return this.appDecisionRepository.find({
      where: { applicationUuid: application.uuid },
      order: {
        date: 'DESC',
      },
    });
  }

  get(uuid) {
    return this.appDecisionRepository.findOne({
      where: { uuid },
    });
  }

  async update(uuid: string, updateData: UpdateApplicationDecisionDto) {
    const decisionMeeting = await this.appDecisionRepository.findOne({
      where: {
        uuid,
      },
    });

    if (!decisionMeeting) {
      throw new ServiceNotFoundException(
        `Decison Meeting with UUID ${uuid} not found`,
      );
    }

    decisionMeeting.date = new Date(updateData.date);
    decisionMeeting.outcome = updateData.outcome;

    return this.appDecisionRepository.save(decisionMeeting);
  }

  async create(
    decisionMeeting: CreateApplicationDecisionDto,
    application: Application,
  ) {
    const decision = new ApplicationDecision({
      outcome: decisionMeeting.outcome,
      date: new Date(decisionMeeting.date),
      application,
    });

    return this.appDecisionRepository.save(decision);
  }

  async delete(uuid) {
    const meeting = await this.get(uuid);
    return this.appDecisionRepository.softRemove([meeting]);
  }
}
