import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
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
  Not,
  Repository,
} from 'typeorm';
import { FileNumberService } from '../../file-number/file-number.service';
import { Card } from '../card/card.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { CodeService } from '../code/code.service';
import { ApplicationLocalGovernmentService } from './application-code/application-local-government/application-local-government.service';
import {
  ApplicationTimeData,
  ApplicationTimeTrackingService,
} from './application-time-tracking.service';
import {
  ApplicationDto,
  ApplicationUpdateServiceDto,
  CreateApplicationServiceDto,
} from './application.dto';
import {
  Application,
  APPLICATION_FILE_NUMBER_SEQUENCE,
} from './application.entity';

export const APPLICATION_EXPIRATION_DAY_RANGES = {
  ACTIVE_DAYS_START: 55,
  ACTIVE_DAYS_END: 60,
};

@Injectable()
export class ApplicationService {
  private DEFAULT_CARD_RELATIONS: FindOptionsRelations<Card> = {
    status: true,
    assignee: true,
    type: true,
  };
  private BOARD_RELATIONS: FindOptionsRelations<Application> = {
    type: true,
    card: {
      ...this.DEFAULT_CARD_RELATIONS,
    },
    region: true,
    decisionMeetings: true,
    localGovernment: true,
  };

  private DEFAULT_RELATIONS: FindOptionsRelations<Application> = {
    type: true,
    card: {
      ...this.DEFAULT_CARD_RELATIONS,
      board: true,
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
    @InjectRepository(ApplicationType)
    private applicationTypeRepository: Repository<ApplicationType>,
    private applicationTimeTrackingService: ApplicationTimeTrackingService,
    private codeService: CodeService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private fileNumberService: FileNumberService,
    @InjectMapper() private applicationMapper: Mapper,
  ) {}

  async create(
    createDto: CreateApplicationServiceDto,
    persist = true,
    createCard = true,
  ): Promise<Application> {
    await this.fileNumberService.checkValidFileNumber(createDto.fileNumber);

    const region = createDto.regionCode
      ? await this.codeService.fetchRegion(createDto.regionCode)
      : undefined;

    const newApplication = new Application({
      fileNumber: createDto.fileNumber,
      applicant: createDto.applicant,
      dateSubmittedToAlc: createDto.dateSubmittedToAlc || undefined,
      localGovernmentUuid: createDto.localGovernmentUuid,
      typeCode: createDto.typeCode,
      region,
      statusHistory: createDto.statusHistory,
      source: createDto.source,
    });

    if (createCard) {
      newApplication.card = new Card();
    }

    if (persist) {
      await this.applicationRepository.save(newApplication);
      return this.getOrFail(createDto.fileNumber);
    } else {
      return newApplication;
    }
  }

  async submit(
    application: CreateApplicationServiceDto,
    createCard = true,
  ): Promise<Application> {
    const existingApplication = await this.applicationRepository.findOne({
      where: { fileNumber: application.fileNumber },
    });

    if (!existingApplication) {
      throw new ServiceValidationException(
        `Application with file number does not exist ${application.fileNumber}`,
      );
    }

    if (!application.localGovernmentUuid) {
      throw new ServiceValidationException(
        `Local government is not set for application ${application.fileNumber}`,
      );
    }

    let region = application.regionCode
      ? await this.codeService.fetchRegion(application.regionCode)
      : undefined;

    if (!region) {
      const localGov = await this.localGovernmentService.getByUuid(
        application.localGovernmentUuid,
      );
      region = localGov?.preferredRegion;
    }

    existingApplication.fileNumber = application.fileNumber;
    existingApplication.applicant = application.applicant;
    existingApplication.dateSubmittedToAlc =
      application.dateSubmittedToAlc || undefined;
    existingApplication.localGovernmentUuid = application.localGovernmentUuid;
    existingApplication.typeCode = application.typeCode;
    existingApplication.region = region;
    existingApplication.statusHistory = application.statusHistory ?? [];

    if (createCard) {
      existingApplication.card = new Card();
    }

    await this.applicationRepository.save(existingApplication);
    return this.getOrFail(application.fileNumber);
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

  async getByBoard(boardUuid: string): Promise<any[]> {
    return await this.applicationRepository.find({
      where: {
        card: {
          boardUuid,
        },
      },
      relations: this.BOARD_RELATIONS,
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

  async getDeletedCard(fileNumber: string) {
    return this.applicationRepository.findOne({
      where: {
        fileNumber,
        card: {
          auditDeletedDateAt: Not(IsNull()),
        },
      },
      withDeleted: true,
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
        val.activeDays &&
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

  async fetchApplicationTypes() {
    return await this.applicationTypeRepository.find({
      select: {
        code: true,
        portalLabel: true,
        htmlDescription: true,
        label: true,
      },
    });
  }

  private async getNextFileNumber() {
    const fileNumberArr = await this.applicationRepository.query(
      `select nextval('${APPLICATION_FILE_NUMBER_SEQUENCE}') limit 1`,
    );
    return fileNumberArr[0].nextval;
  }

  async generateNextFileNumber(): Promise<string> {
    let fileNumber: string;
    let application: Application | null = null;
    do {
      fileNumber = await this.getNextFileNumber();
      application = await this.applicationRepository.findOne({
        where: { fileNumber },
      });
    } while (application);

    return fileNumber;
  }

  async getUuid(fileNumber: string) {
    const application = await this.applicationRepository.findOneOrFail({
      where: {
        fileNumber,
      },
      select: {
        uuid: true,
      },
    });
    return application.uuid;
  }

  async getFileNumber(uuid: string) {
    const application = await this.applicationRepository.findOneOrFail({
      where: {
        uuid,
      },
      select: {
        fileNumber: true,
      },
    });
    return application.fileNumber;
  }

  async getByUuidOrFail(uuid: string) {
    return await this.applicationRepository.findOneOrFail({
      where: {
        uuid,
      },
    });
  }
}
