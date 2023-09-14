import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { filterMiddleware } from '@nestjs/core/middleware/utils';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NOI_SUBMISSION_STATUS } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NOTIFICATION_STATUS } from '../../alcs/notification/notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from '../../alcs/notification/notification-submission-status/notification-submission-status.service';
import { NotificationService } from '../../alcs/notification/notification.service';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { FALLBACK_APPLICANT_NAME } from '../../utils/owner.constants';
import { filterUndefined } from '../../utils/undefined';
import { ValidatedNotificationSubmission } from './notification-submission-validator.service';
import {
  NotificationSubmissionDetailedDto,
  NotificationSubmissionDto,
  NotificationSubmissionUpdateDto,
} from './notification-submission.dto';
import { NotificationSubmission } from './notification-submission.entity';

@Injectable()
export class NotificationSubmissionService {
  private logger: Logger = new Logger(NotificationSubmissionService.name);

  private DEFAULT_RELATIONS: FindOptionsRelations<NotificationSubmission> = {
    createdBy: true,
    transferees: {
      type: true,
    },
    parcels: true,
  };

  constructor(
    @InjectRepository(NotificationSubmission)
    private notificationSubmissionRepository: Repository<NotificationSubmission>,
    private notificationService: NotificationService,
    private localGovernmentService: LocalGovernmentService,
    private fileNumberService: FileNumberService,
    private notificationSubmissionStatusService: NotificationSubmissionStatusService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getOrFailByFileNumber(fileNumber: string) {
    return await this.notificationSubmissionRepository.findOneOrFail({
      where: {
        fileNumber,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async create(type: string, createdBy: User) {
    const fileNumber = await this.fileNumberService.generateNextFileNumber();

    await this.notificationService.create({
      fileNumber,
      applicant: FALLBACK_APPLICANT_NAME,
      typeCode: type,
    });

    const noiSubmission = new NotificationSubmission({
      fileNumber,
      typeCode: type,
      createdBy,
    });

    const savedSubmission = await this.notificationSubmissionRepository.save(
      noiSubmission,
    );

    await this.notificationSubmissionStatusService.setInitialStatuses(
      savedSubmission.uuid,
    );

    return fileNumber;
  }

  async update(
    submissionUuid: string,
    updateDto: NotificationSubmissionUpdateDto,
    user: User,
  ) {
    const notificationSubmission = await this.getByUuid(submissionUuid, user);

    notificationSubmission.applicant = updateDto.applicant;
    notificationSubmission.submittersFileNumber = filterUndefined(
      updateDto.submittersFileNumber,
      notificationSubmission.submittersFileNumber,
    );
    notificationSubmission.purpose = filterUndefined(
      updateDto.purpose,
      notificationSubmission.purpose,
    );
    notificationSubmission.totalArea = filterUndefined(
      updateDto.totalArea,
      notificationSubmission.totalArea,
    );
    notificationSubmission.hasSurveyPlan = filterUndefined(
      updateDto.hasSurveyPlan,
      notificationSubmission.hasSurveyPlan,
    );

    notificationSubmission.localGovernmentUuid = updateDto.localGovernmentUuid;
    notificationSubmission.contactFirstName = filterUndefined(
      updateDto.contactFirstName,
      notificationSubmission.contactFirstName,
    );
    notificationSubmission.contactLastName = filterUndefined(
      updateDto.contactLastName,
      notificationSubmission.contactLastName,
    );
    notificationSubmission.contactOrganization = filterUndefined(
      updateDto.contactOrganization,
      notificationSubmission.contactOrganization,
    );
    notificationSubmission.contactPhone = filterUndefined(
      updateDto.contactPhone,
      notificationSubmission.contactPhone,
    );
    notificationSubmission.contactEmail = filterUndefined(
      updateDto.contactEmail,
      notificationSubmission.contactEmail,
    );

    await this.notificationSubmissionRepository.save(notificationSubmission);

    if (updateDto.localGovernmentUuid) {
      await this.notificationService.update(notificationSubmission.fileNumber, {
        localGovernmentUuid: updateDto.localGovernmentUuid,
      });
    }

    return this.getByUuid(submissionUuid, user);
  }

  async getFileNumber(submissionUuid: string) {
    const submission = await this.notificationSubmissionRepository.findOne({
      where: {
        uuid: submissionUuid,
      },
      select: {
        uuid: true,
        fileNumber: true,
      },
    });
    return submission?.fileNumber;
  }

  async getAllByUser(user: User) {
    const whereClauses = await this.generateWhereClauses({}, user);

    return this.notificationSubmissionRepository.find({
      where: whereClauses,
      order: {
        auditUpdatedAt: 'DESC',
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByFileNumber(fileNumber: string, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return await this.getOrFailByFileNumber(fileNumber);
    }

    const whereClauses = await this.generateWhereClauses(
      {
        fileNumber,
      },
      user,
    );

    return await this.notificationSubmissionRepository.findOneOrFail({
      where: whereClauses,
      order: {
        auditUpdatedAt: 'DESC',
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByUuid(uuid: string, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return await this.notificationSubmissionRepository.findOneOrFail({
        where: {
          uuid,
        },
        relations: {
          ...this.DEFAULT_RELATIONS,
        },
      });
    }

    const findOptions = await this.generateWhereClauses(
      {
        uuid,
      },
      user,
    );

    return this.notificationSubmissionRepository.findOneOrFail({
      where: findOptions,
      relations: {
        ...this.DEFAULT_RELATIONS,
      },
      order: {
        auditUpdatedAt: 'DESC',
      },
    });
  }

  private async generateWhereClauses(
    searchOptions: FindOptionsWhere<NotificationSubmission>,
    user: User,
  ) {
    const searchQueries: FindOptionsWhere<NotificationSubmission>[] = [];

    searchQueries.push({
      ...searchOptions,
      createdBy: {
        uuid: user.uuid,
      },
    });

    if (user.bceidBusinessGuid) {
      searchQueries.push({
        ...searchOptions,
        createdBy: {
          bceidBusinessGuid: user.bceidBusinessGuid,
        },
      });

      const matchingLocalGovernment =
        await this.localGovernmentService.getByGuid(user.bceidBusinessGuid);
      if (matchingLocalGovernment) {
        searchQueries.push({
          ...searchOptions,
          localGovernmentUuid: matchingLocalGovernment.uuid,
          notification: {
            dateSubmittedToAlc: Not(IsNull()),
          },
        });
      }
    }

    return searchQueries;
  }

  async mapToDTOs(submissions: NotificationSubmission[], user: User) {
    const types = await this.notificationService.listTypes();

    return submissions.map((notificationSubmission) => {
      const isCreator = notificationSubmission.createdBy.uuid === user.uuid;
      const isSameAccount =
        user.bceidBusinessGuid &&
        notificationSubmission.createdBy.bceidBusinessGuid ===
          user.bceidBusinessGuid;

      return {
        ...this.mapper.map(
          notificationSubmission,
          NotificationSubmission,
          NotificationSubmissionDto,
        ),
        type: types.find(
          (type) => type.code === notificationSubmission.typeCode,
        )!.label,
        canEdit:
          [NOTIFICATION_STATUS.IN_PROGRESS].includes(
            notificationSubmission.status.statusTypeCode as NOTIFICATION_STATUS,
          ) &&
          (isCreator || isSameAccount),
        canView:
          notificationSubmission.status.statusTypeCode !==
          SUBMISSION_STATUS.CANCELLED,
      };
    });
  }

  async mapToDetailedDTO(
    notificationSubmission: NotificationSubmission,
    user: User,
  ) {
    const types = await this.notificationService.listTypes();
    const mappedApp = this.mapper.map(
      notificationSubmission,
      NotificationSubmission,
      NotificationSubmissionDetailedDto,
    );
    const isCreator = notificationSubmission.createdBy.uuid === user.uuid;
    const isSameAccount =
      user.bceidBusinessGuid &&
      notificationSubmission.createdBy.bceidBusinessGuid ===
        user.bceidBusinessGuid;

    return {
      ...mappedApp,
      type: types.find((type) => type.code === notificationSubmission.typeCode)!
        .label,
      canEdit:
        [NOTIFICATION_STATUS.IN_PROGRESS].includes(
          notificationSubmission.status.statusTypeCode as NOTIFICATION_STATUS,
        ) &&
        (isCreator || isSameAccount),
      canView:
        notificationSubmission.status.statusTypeCode !==
        SUBMISSION_STATUS.CANCELLED,
    };
  }

  async submitToAlcs(notificationSubmission: ValidatedNotificationSubmission) {
    try {
      const submittedNotification = await this.notificationService.submit({
        fileNumber: notificationSubmission.fileNumber,
        applicant: notificationSubmission.applicant,
        localGovernmentUuid: notificationSubmission.localGovernmentUuid,
        typeCode: notificationSubmission.typeCode,
        dateSubmittedToAlc: new Date(),
      });

      await this.notificationSubmissionStatusService.setStatusDate(
        notificationSubmission.uuid,
        NOTIFICATION_STATUS.SUBMITTED_TO_ALC,
        submittedNotification.dateSubmittedToAlc,
      );

      return submittedNotification;
    } catch (ex) {
      this.logger.error(ex);
      throw new BaseServiceException(
        `Failed to submit notification: ${notificationSubmission.fileNumber}`,
      );
    }
  }

  async updateStatus(
    uuid: string,
    statusCode: NOTIFICATION_STATUS,
    effectiveDate?: Date | null,
  ) {
    const submission = await this.loadBarebonesSubmission(uuid);
    await this.notificationSubmissionStatusService.setStatusDate(
      submission.uuid,
      statusCode,
      effectiveDate,
    );
  }

  async cancel(submission: NotificationSubmission) {
    return await this.notificationSubmissionStatusService.setStatusDate(
      submission.uuid,
      NOTIFICATION_STATUS.CANCELLED,
    );
  }

  private loadBarebonesSubmission(uuid: string) {
    //Load submission without relations to prevent save from crazy cascading
    return this.notificationSubmissionRepository.findOneOrFail({
      where: {
        uuid,
      },
    });
  }
}
