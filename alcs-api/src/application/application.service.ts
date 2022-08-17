import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { ApplicationDecisionMaker } from './application-code/application-decision-maker/application-decision-maker.entity';
import {
  ApplicationTimeData,
  ApplicationTimeTrackingService,
} from './application-time-tracking.service';
import { ApplicationDto } from './application.dto';
import { Application } from './application.entity';

export const APPLICATION_EXPIRATION_DAY_RANGES = {
  ACTIVE_DAYS_START: 55,
  ACTIVE_DAYS_END: 60,
};

@Injectable()
export class ApplicationService {
  private DEFAULT_RELATIONS = [
    'status',
    'type',
    'assignee',
    'decisionMaker',
    'region',
  ];
  private logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private applicationTimeTrackingService: ApplicationTimeTrackingService,
    @InjectMapper() private applicationMapper: Mapper,
  ) {}

  async resetApplicationStatus(
    sourceStatusId: string,
    targetStatusId: string,
  ): Promise<void> {
    await this.applicationRepository.update(
      {
        statusUuid: sourceStatusId,
      },
      {
        statusUuid: targetStatusId,
      },
    );
  }

  async createOrUpdate(
    application: Partial<Application>,
  ): Promise<Application> {
    const existingApplication = await this.applicationRepository.findOne({
      where: { fileNumber: application.fileNumber },
    });

    const updatedApp = Object.assign(
      existingApplication || new Application(),
      application,
    );
    await this.applicationRepository.save(updatedApp);

    //Save does not return the full entity in case of update
    return this.applicationRepository.findOne({
      where: {
        uuid: updatedApp.uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async delete(applicationNumber: string): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { fileNumber: applicationNumber },
    });

    await this.applicationRepository.softRemove([application]);
    return;
  }

  async getAll({
    decisionMaker,
    assigneeUuid,
  }: {
    decisionMaker?: ApplicationDecisionMaker;
    assigneeUuid?: string;
  }): Promise<Application[]> {
    const whereClause: FindOptionsWhere<Application> = {};
    if (decisionMaker) {
      whereClause.decisionMakerUuid = decisionMaker.uuid;
    }
    if (assigneeUuid) {
      whereClause.assigneeUuid = assigneeUuid;
    }

    return await this.applicationRepository.find({
      where: whereClause,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async get(fileNumber: string) {
    return this.applicationRepository.findOne({
      where: {
        fileNumber,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getApplicationsNearExpiryDates(startDate: Date, endDate: Date) {
    const applications = await this.applicationRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    let applicationsProcessingTimes: Map<string, ApplicationTimeData>;

    if (applications && applications.length > 0) {
      applicationsProcessingTimes =
        await this.applicationTimeTrackingService.fetchApplicationActiveTimes(
          applications,
        );
    }

    const applicationsToProcess: Application[] = [];

    applicationsProcessingTimes.forEach((val, key) => {
      if (
        val.activeDays >= APPLICATION_EXPIRATION_DAY_RANGES.ACTIVE_DAYS_START &&
        val.activeDays <= APPLICATION_EXPIRATION_DAY_RANGES.ACTIVE_DAYS_END
      ) {
        applicationsToProcess.push(applications.find((ap) => ap.uuid === key));
      } else {
        applicationsProcessingTimes.delete(key);
      }
    });

    return applicationsToProcess;
  }

  async mapApplicationsToDtos(
    applications: Application[],
  ): Promise<ApplicationDto[]> {
    const appTimeMap =
      await this.applicationTimeTrackingService.fetchApplicationActiveTimes(
        applications,
      );

    return applications.map((app) => ({
      ...this.applicationMapper.map(app, Application, ApplicationDto),
      activeDays: appTimeMap.get(app.uuid).activeDays || 0,
      pausedDays: appTimeMap.get(app.uuid).pausedDays || 0,
    }));
  }
}
