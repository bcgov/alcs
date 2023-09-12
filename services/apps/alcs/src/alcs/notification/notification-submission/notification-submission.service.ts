import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSubmissionDetailedDto } from '../../../portal/notification-submission/notification-submission.dto';
import { NotificationSubmission } from '../../../portal/notification-submission/notification-submission.entity';
import { NotificationSubmissionStatusType } from '../notification-submission-status/notification-status-type.entity';
import { NOTIFICATION_STATUS } from '../notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from '../notification-submission-status/notification-submission-status.service';

@Injectable()
export class NotificationSubmissionService {
  constructor(
    @InjectRepository(NotificationSubmission)
    private notificationSubmissionRepo: Repository<NotificationSubmission>,
    @InjectRepository(NotificationSubmissionStatusType)
    private notificationSubmissionStatusTypeRepo: Repository<NotificationSubmissionStatusType>,
    @InjectMapper() private mapper: Mapper,
    private notificationSubmissionStatusService: NotificationSubmissionStatusService,
  ) {}

  async get(fileNumber: string) {
    return await this.notificationSubmissionRepo.findOneOrFail({
      where: { fileNumber },
      relations: {
        notification: {
          documents: {
            document: true,
          },
        },
        transferees: {
          type: true,
        },
      },
    });
  }

  async mapToDto(submission: NotificationSubmission) {
    return await this.mapper.mapAsync(
      submission,
      NotificationSubmission,
      NotificationSubmissionDetailedDto,
    );
  }

  async getStatus(code: NOTIFICATION_STATUS) {
    return await this.notificationSubmissionStatusTypeRepo.findOneOrFail({
      where: {
        code,
      },
    });
  }

  async updateStatus(fileNumber: string, statusCode: NOTIFICATION_STATUS) {
    const submission = await this.loadBarebonesSubmission(fileNumber);
    await this.notificationSubmissionStatusService.setStatusDate(
      submission.uuid,
      statusCode,
    );
  }

  public loadBarebonesSubmission(fileNumber: string) {
    //Load submission without relations to prevent save from crazy cascading
    return this.notificationSubmissionRepo.findOneOrFail({
      where: {
        fileNumber,
      },
    });
  }
}
