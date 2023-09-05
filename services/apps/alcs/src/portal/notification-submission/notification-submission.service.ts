import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NOI_SUBMISSION_STATUS } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NotificationService } from '../../alcs/notification/notification.service';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { FALLBACK_APPLICANT_NAME } from '../../utils/owner.constants';
import { filterUndefined } from '../../utils/undefined';
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

    // await this.noticeOfIntentSubmissionStatusService.setInitialStatuses(
    //   savedSubmission.uuid,
    // );

    return fileNumber;
  }

  async update(
    submissionUuid: string,
    updateDto: NotificationSubmissionUpdateDto,
    user: User,
  ) {
    const notificationSubmission = await this.getByUuid(submissionUuid, user);

    notificationSubmission.applicant = updateDto.applicant;
    notificationSubmission.purpose = filterUndefined(
      updateDto.purpose,
      notificationSubmission.purpose,
    );
    notificationSubmission.localGovernmentUuid = updateDto.localGovernmentUuid;

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

    return this.notificationSubmissionRepository.findOneOrFail({
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

    return submissions.map((noiSubmission) => {
      const isCreator = noiSubmission.createdBy.uuid === user.uuid;
      const isSameAccount =
        user.bceidBusinessGuid &&
        noiSubmission.createdBy.bceidBusinessGuid === user.bceidBusinessGuid;

      return {
        ...this.mapper.map(
          noiSubmission,
          NotificationSubmission,
          NotificationSubmissionDto,
        ),
        type: types.find((type) => type.code === noiSubmission.typeCode)!.label,
        canEdit: isCreator || isSameAccount,
        canView: true,
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
      canEdit: isCreator || isSameAccount,
      canView: true,
    };
  }

  async submitToAlcs(notificationSubmission: NotificationSubmission) {
    try {
      const submittedNotification = await this.notificationService.submit({
        fileNumber: notificationSubmission.fileNumber,
        applicant: notificationSubmission.applicant!,
        localGovernmentUuid: notificationSubmission.localGovernmentUuid!,
        typeCode: notificationSubmission.typeCode,
        dateSubmittedToAlc: new Date(),
      });

      // await this.noticeOfIntentSubmissionStatusService.setStatusDate(
      //   notificationSubmission.uuid,
      //   NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      //   submittedNotification.dateSubmittedToAlc,
      // );

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
    statusCode: NOI_SUBMISSION_STATUS,
    effectiveDate?: Date | null,
  ) {
    const submission = await this.loadBarebonesSubmission(uuid);
    // await this.noticeOfIntentSubmissionStatusService.setStatusDate(
    //   submission.uuid,
    //   statusCode,
    //   effectiveDate,
    // );
  }

  async getStatus(code: NOI_SUBMISSION_STATUS) {
    // return await this.noticeOfIntentStatusRepository.findOneOrFail({
    //   where: {
    //     code,
    //   },
    // });
  }

  async cancel(submission: NotificationSubmission) {
    // return await this.noticeOfIntentSubmissionStatusService.setStatusDate(
    //   noticeOfIntentSubmission.uuid,
    //   NOI_SUBMISSION_STATUS.CANCELLED,
    // );
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
