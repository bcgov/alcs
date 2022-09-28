import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  IsNull,
  Like,
  Repository,
} from 'typeorm';
import { FindOptionsRelations } from 'typeorm/browser';
import { Card } from '../card/card.entity';
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
  private DEFAULT_RELATIONS: FindOptionsRelations<Application> = {
    type: true,
    card: {
      status: true,
      board: true,
      assignee: true,
    },
    region: true,
    decisionMeetings: true,
  };
  private SUBTASK_RELATIONS: FindOptionsRelations<Application> = {
    ...this.DEFAULT_RELATIONS,
    card: {
      status: true,
      board: true,
      assignee: true,
      subtasks: {
        type: true,
        assignee: true,
      },
    },
  };
  private logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private applicationTimeTrackingService: ApplicationTimeTrackingService,
    @InjectMapper() private applicationMapper: Mapper,
  ) {}

  async createOrUpdate(
    application: Partial<Application>,
  ): Promise<Application> {
    let existingApplication = await this.applicationRepository.findOne({
      where: { fileNumber: application.fileNumber },
    });

    if (!existingApplication) {
      existingApplication = new Application();
      existingApplication.card = new Card();
    }

    const updatedApp = Object.assign(existingApplication, application);

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

  async getAll(
    findOptions?: FindOptionsWhere<Application>,
    sortOptions?: FindOptionsOrder<Application>,
  ): Promise<Application[]> {
    return await this.applicationRepository.find({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
      order: sortOptions,
    });
  }

  async get(fileNumber: string) {
    return this.applicationRepository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        ...this.SUBTASK_RELATIONS,
      },
    });
  }

  async getAllApplicationsWithIncompleteSubtasks(subtaskType: string) {
    return this.applicationRepository.find({
      where: {
        card: {
          subtasks: {
            completedAt: IsNull(),
            type: {
              type: subtaskType,
            },
          },
        },
      },
      relations: {
        ...this.SUBTASK_RELATIONS,
      },
    });
  }

  async getByCard(cardUuid: string) {
    return this.applicationRepository.findOne({
      where: {
        card: { uuid: cardUuid },
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getAllNearExpiryDates(startDate: Date, endDate: Date) {
    const applications = await this.applicationRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    let applicationsProcessingTimes: Map<string, ApplicationTimeData>;

    if (applications && applications.length > 0) {
      applicationsProcessingTimes =
        await this.applicationTimeTrackingService.fetchActiveTimes(
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

  async mapToDtos(applications: Application[]): Promise<ApplicationDto[]> {
    const appTimeMap =
      await this.applicationTimeTrackingService.fetchActiveTimes(applications);

    const appPausedMap =
      await this.applicationTimeTrackingService.getPausedStatus(applications);

    return applications.map((app) => ({
      ...this.applicationMapper.map(app, Application, ApplicationDto),
      activeDays: appTimeMap.get(app.uuid).activeDays || 0,
      pausedDays: appTimeMap.get(app.uuid).pausedDays || 0,
      paused: appPausedMap.get(app.uuid) || false,
    }));
  }

  searchApplicationsByFileNumber(fileNumber: string) {
    return this.getAll(
      {
        fileNumber: Like(`${fileNumber}%`),
      },
      {
        fileNumber: 'ASC',
      },
    );
  }
}
