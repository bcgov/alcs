import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Like,
  Repository,
} from 'typeorm';
import { Card } from '../card/card.entity';
import { CodeService } from '../code/code.service';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../common/exceptions/base.exception';
import {
  ApplicationTimeData,
  ApplicationTimeTrackingService,
} from './application-time-tracking.service';
import {
  ApplicationDto,
  ApplicationUpdateServiceDto,
  CreateApplicationServiceDto,
} from './application.dto';
import { Application } from './application.entity';

export const APPLICATION_EXPIRATION_DAY_RANGES = {
  ACTIVE_DAYS_START: 55,
  ACTIVE_DAYS_END: 60,
};

@Injectable()
export class ApplicationService {
  private DEFAULT_CARD_RELATIONS: FindOptionsRelations<Card> = {
    status: true,
    board: true,
    assignee: true,
    type: true,
  };
  private DEFAULT_RELATIONS: FindOptionsRelations<Application> = {
    type: true,
    card: {
      ...this.DEFAULT_CARD_RELATIONS,
    },
    region: true,
    decisionMeetings: true,
    localGovernment: true,
  };
  private SUBTASK_RELATIONS: FindOptionsRelations<Application> = {
    ...this.DEFAULT_RELATIONS,
    card: {
      ...this.DEFAULT_CARD_RELATIONS,
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
    private codeService: CodeService,
    @InjectMapper() private applicationMapper: Mapper,
  ) {}

  async create(
    application: CreateApplicationServiceDto,
    persist = true,
  ): Promise<Application> {
    const existingApplication = await this.applicationRepository.findOne({
      where: { fileNumber: application.fileNumber },
    });

    if (existingApplication) {
      throw new ServiceValidationException(
        'Application with file number already exists',
      );
    }

    const region = application.regionCode
      ? await this.codeService.fetchRegion(application.regionCode)
      : undefined;

    const newApplication = new Application({
      fileNumber: application.fileNumber,
      applicant: application.applicant,
      dateSubmittedToAlc: application.dateSubmittedToAlc || undefined,
      localGovernmentUuid: application.localGovernmentUuid,
      typeCode: application.typeCode,
      region,
    });

    newApplication.card = new Card();

    if (persist) {
      await this.applicationRepository.save(newApplication);
      return this.getOrFail(application.fileNumber);
    } else {
      return newApplication;
    }
  }

  async updateByFileNumber(
    fileNumber: string,
    updates: ApplicationUpdateServiceDto,
  ) {
    const existingApplication = await this.applicationRepository.findOne({
      where: { fileNumber },
    });

    if (!existingApplication) {
      throw new ServiceNotFoundException(
        `Application not found with file number ${fileNumber}`,
      );
    }

    return this.update(existingApplication, updates);
  }

  async updateByUuid(uuid: string, updates: ApplicationUpdateServiceDto) {
    const existingApplication = await this.applicationRepository.findOne({
      where: { uuid },
    });

    if (!existingApplication) {
      throw new ServiceNotFoundException(
        `Application not found with file number ${uuid}`,
      );
    }

    return this.update(existingApplication, updates);
  }

  async update(
    existingApplication: Application,
    updates: ApplicationUpdateServiceDto,
  ): Promise<Application> {
    await this.applicationRepository.update(existingApplication.uuid, updates);
    return this.getOrFail(existingApplication.fileNumber);
  }

  async delete(applicationNumber: string): Promise<void> {
    const application = await this.getOrFail(applicationNumber);
    await this.applicationRepository.softRemove([application]);
    return;
  }

  async getMany(
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

  async getOrFail(fileNumber: string) {
    const application = await this.get(fileNumber);

    if (!application) {
      throw new ServiceNotFoundException(
        `Application with provided number not found ${fileNumber}`,
      );
    }

    return application;
  }

  async getWithIncompleteSubtaskByType(subtaskType: string) {
    return this.applicationRepository.find({
      where: {
        card: {
          subtasks: {
            completedAt: IsNull(),
            type: {
              code: subtaskType,
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
    return this.applicationRepository.findOneOrFail({
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

    let applicationsProcessingTimes: Map<string, ApplicationTimeData> =
      new Map();
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
        applicationsToProcess.push(applications.find((ap) => ap.uuid === key)!);
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
      activeDays: appTimeMap.get(app.uuid)!.activeDays || 0,
      pausedDays: appTimeMap.get(app.uuid)!.pausedDays || 0,
      paused: appPausedMap.get(app.uuid) || false,
    }));
  }

  searchApplicationsByFileNumber(fileNumber: string) {
    return this.getMany(
      {
        fileNumber: Like(`${fileNumber}%`),
      },
      {
        fileNumber: 'ASC',
      },
    );
  }
}
