import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
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
import { ApplicationSubmissionStatusService } from './application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from './application-submission-status/submission-status.dto';
import { FileNumberService } from '../../file-number/file-number.service';
import { Card } from '../card/card.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { CodeService } from '../code/code.service';
import { LocalGovernmentService } from '../local-government/local-government.service';
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
import { ApplicationDecisionMeeting } from './application-decision-meeting/application-decision-meeting.entity';
import { CARD_STATUS } from '../card/card-status/card-status.entity';

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
    board: true,
  };
  private BOARD_RELATIONS: FindOptionsRelations<Application> = {
    type: true,
    card: this.DEFAULT_CARD_RELATIONS,
    region: true,
    decisionMeetings: true,
    localGovernment: true,
  };

  private DEFAULT_RELATIONS: FindOptionsRelations<Application> = {
    type: true,
    card: this.DEFAULT_CARD_RELATIONS,
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

  private excludeStatuses = [
    CARD_STATUS.INCOMING,
    CARD_STATUS.INCOMING_PRELIM_REVIEW,
    CARD_STATUS.DECISION_RELEASED,
    CARD_STATUS.CANCELLED,
    CARD_STATUS.PRELIM_DONE,
  ];

  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationType)
    private applicationTypeRepository: Repository<ApplicationType>,
    private applicationTimeTrackingService: ApplicationTimeTrackingService,
    private codeService: CodeService,
    private localGovernmentService: LocalGovernmentService,
    private fileNumberService: FileNumberService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
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
    const appExists = await this.applicationRepository.exist({
      where: { uuid },
    });

    if (!appExists) {
      throw new ServiceNotFoundException(
        `Application not found with file number ${uuid}`,
      );
    }

    await this.applicationRepository.update(uuid, updates);
    return this.getByUuidOrFail(uuid);
  }

  async update(
    existingApplication: Application,
    updates: ApplicationUpdateServiceDto,
  ): Promise<Application> {
    await this.applicationRepository.update(existingApplication.uuid, updates);

    try {
      if (updates.dateAcknowledgedIncomplete !== undefined) {
        await this.applicationSubmissionStatusService.setStatusDateByFileNumber(
          existingApplication.fileNumber,
          SUBMISSION_STATUS.SUBMITTED_TO_ALC_INCOMPLETE,
          updates.dateAcknowledgedIncomplete,
        );
      }

      if (updates.dateReceivedAllItems !== undefined) {
        await this.applicationSubmissionStatusService.setStatusDateByFileNumber(
          existingApplication.fileNumber,
          SUBMISSION_STATUS.RECEIVED_BY_ALC,
          updates.dateReceivedAllItems,
        );
      }
    } catch (error) {
      if (error instanceof ServiceNotFoundException) {
        this.logger.warn(error.message, error);
      } else {
        throw error;
      }
    }

    return this.getOrFail(existingApplication.fileNumber);
  }

  async delete(applicationNumber: string): Promise<void> {
    const application = await this.getOrFail(applicationNumber);
    await this.applicationRepository.softRemove([application]);
    return;
  }

  async cancel(fileNumber: string): Promise<void> {
    await this.applicationSubmissionStatusService.setStatusDateByFileNumber(
      fileNumber,
      SUBMISSION_STATUS.CANCELLED,
    );
    return;
  }

  async uncancel(fileNumber: string) {
    await this.applicationSubmissionStatusService.setStatusDateByFileNumber(
      fileNumber,
      SUBMISSION_STATUS.CANCELLED,
      null,
    );
    return;
  }

  async getMany(
    findOptions?: FindOptionsWhere<Application>,
    sortOptions?: FindOptionsOrder<Application>,
  ): Promise<Application[]> {
    return await this.applicationRepository.find({
      where: findOptions,
      relations: {
        ...this.DEFAULT_RELATIONS,
        card: {
          ...this.DEFAULT_CARD_RELATIONS,
          board: true,
        },
      },
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
      relations: {
        ...this.BOARD_RELATIONS,
        card: { ...this.DEFAULT_CARD_RELATIONS, board: false },
      },
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
        requiresGovernmentReview: true,
        portalOrder: true,
        alcFeeAmount: true,
        governmentFeeAmount: true,
      },
    });
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
        uuid: true,
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

  async updateApplicant(fileNumber: string, applicantName: string) {
    await this.applicationRepository.update(
      {
        fileNumber,
      },
      {
        applicant: applicantName,
      },
    );
  }

  async getIncomingApplicationFiles(): Promise<
    {
      uuid: string;
      file_number: string;
      applicant: string;
      code: string;
      name: string;
      given_name: string;
      family_name: string;
      high_priority: boolean;
      active_days: number;
    }[]
  > {
    const query = `
      WITH filtered_applications AS (
        SELECT a.uuid FROM alcs.application a 
        LEFT JOIN alcs.application_decision_meeting adm ON adm.application_uuid = a."uuid"
        INNER JOIN alcs.card c ON c."uuid" = a.card_uuid
        WHERE c.status_code NOT IN (${this.excludeStatuses.map((_, index) => `$${index + 1}`).join(', ')})
        AND c.archived != TRUE
        GROUP BY a.uuid
        HAVING COUNT(adm.uuid) = 0
        OR COUNT(CASE WHEN adm.audit_deleted_date_at IS NULL THEN 1 END) = 0
      ),
      calculated AS (
        SELECT * 
        FROM alcs.calculate_active_days(ARRAY(SELECT fa."uuid" FROM filtered_applications fa))
      )
      SELECT a.uuid, a.file_number, a.applicant, board.code, u.name, u.given_name, u.family_name, c.high_priority, calc.active_days FROM alcs.application a 
      INNER JOIN alcs.card c ON c."uuid" = a.card_uuid 
      INNER JOIN calculated calc ON a."uuid" = calc.application_uuid
      INNER JOIN alcs.board board on c.board_uuid = board.uuid
      LEFT JOIN alcs.user u on u.uuid = c.assignee_uuid
      WHERE a.uuid IN (SELECT uuid FROM filtered_applications)
      ORDER BY c.high_priority DESC, calc.active_days DESC;
    `;
    return await this.applicationRepository.query(query, this.excludeStatuses);
  }

  async getIncomingReconsiderationFiles(): Promise<
    {
      uuid: string;
      file_number: string;
      applicant: string;
      code: string;
      name: string;
      given_name: string;
      family_name: string;
      high_priority: boolean;
      active_days: number;
    }[]
  > {
    const query = `
      WITH latest_meeting AS (
        SELECT adm.application_uuid, MAX(adm.date) AS latest_meeting_date
        FROM alcs.application_decision_meeting adm
        GROUP BY adm.application_uuid
      ),
      filtered_applications AS (
        SELECT ar.application_uuid FROM alcs.application_reconsideration ar
        INNER JOIN alcs.application a on a.uuid = ar.application_uuid
        LEFT JOIN latest_meeting lm on lm.application_uuid = ar.application_uuid
        LEFT JOIN alcs.application_decision_meeting adm ON adm.application_uuid = ar.application_uuid
        AND adm.date = lm.latest_meeting_date
        INNER JOIN alcs.card c ON c."uuid" = ar.card_uuid
        WHERE c.status_code NOT IN (${this.excludeStatuses.map((_, index) => `$${index + 1}`).join(', ')})
        AND c.archived != TRUE
        GROUP BY ar.application_uuid
        HAVING COUNT(adm.uuid) = 0
        OR COUNT(CASE WHEN adm.audit_deleted_date_at IS NULL THEN 1 END) = 0
        OR COUNT(CASE WHEN adm.date < ar.submitted_date AND adm.audit_deleted_date_at is NULL THEN 1 END) > 0
      ),
      calculated AS (
        SELECT * 
        FROM alcs.calculate_active_days(ARRAY(SELECT fa."application_uuid" FROM filtered_applications fa))
      )
      SELECT a.uuid, a.file_number, a.applicant, board.code, u.name, u.given_name, u.family_name, c.high_priority, calc.active_days FROM alcs.application a
      INNER JOIN alcs.application_reconsideration ar on ar.application_uuid = a.uuid
      INNER JOIN alcs.card c ON c."uuid" = ar.card_uuid 
      INNER JOIN calculated calc ON a."uuid" = calc.application_uuid
      INNER JOIN alcs.board board on c.board_uuid = board.uuid
      LEFT JOIN alcs.user u on u.uuid = c.assignee_uuid
      WHERE a.uuid IN (SELECT application_uuid FROM filtered_applications)
      ORDER BY c.high_priority DESC, calc.active_days DESC;
    `;
    return await this.applicationRepository.query(query, this.excludeStatuses);
  }
}
