import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { Repository } from 'typeorm';
import { NotificationSubmission } from '../../../portal/notification-submission/notification-submission.entity';
import { NotificationSubmissionStatusType } from './notification-status-type.entity';
import { NOTIFICATION_STATUS } from './notification-status.dto';
import { NotificationSubmissionToSubmissionStatus } from './notification-status.entity';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class NotificationSubmissionStatusService {
  constructor(
    @InjectRepository(NotificationSubmissionToSubmissionStatus)
    private statusesRepository: Repository<NotificationSubmissionToSubmissionStatus>,
    @InjectRepository(NotificationSubmissionStatusType)
    private submissionStatusTypeRepository: Repository<NotificationSubmissionStatusType>,
    @InjectRepository(NotificationSubmission)
    private notificationSubmissionRepository: Repository<NotificationSubmission>,
  ) {}

  async setInitialStatuses(submissionUuid: string, persist = true) {
    const statuses = await this.submissionStatusTypeRepository.find();
    const newStatuses: NotificationSubmissionToSubmissionStatus[] = [];

    for (const status of statuses) {
      const newStatus = new NotificationSubmissionToSubmissionStatus({
        submissionUuid: submissionUuid,
        statusTypeCode: status.code,
      });

      if (newStatus.statusTypeCode === NOTIFICATION_STATUS.IN_PROGRESS) {
        newStatus.effectiveDate = dayjs()
          .tz('Canada/Pacific')
          .startOf('day')
          .toDate();
      }

      newStatuses.push(newStatus);
    }

    if (persist) {
      return await this.statusesRepository.save(newStatuses);
    }

    return newStatuses;
  }

  async setStatusDate(
    submissionUuid: string,
    statusTypeCode: string,
    effectiveDate?: Date | null,
  ) {
    const status = await this.statusesRepository.findOneOrFail({
      where: {
        submissionUuid,
        statusTypeCode,
      },
    });

    let date = new Date();
    if (effectiveDate) {
      date = effectiveDate;
    }
    date = dayjs(date).tz('Canada/Pacific').startOf('day').toDate();
    status.effectiveDate = effectiveDate !== null ? date : effectiveDate;

    return this.statusesRepository.save(status);
  }

  async setStatusDateByFileNumber(
    fileNumber: string,
    statusTypeCode: string,
    effectiveDate?: Date | null,
  ) {
    const submission = await this.getSubmission(fileNumber);
    return await this.setStatusDate(
      submission.uuid,
      statusTypeCode,
      effectiveDate,
    );
  }

  async getCurrentStatusesBy(submissionUuid: string) {
    return await this.statusesRepository.findBy({ submissionUuid });
  }

  async getCurrentStatusesByFileNumber(fileNumber: string) {
    const submission = await this.getSubmission(fileNumber);

    return await this.statusesRepository.findBy({
      submissionUuid: submission?.uuid,
    });
  }

  async getCurrentStatusByFileNumber(fileNumber: string) {
    const submission = await this.getSubmission(fileNumber);

    return submission.status;
  }

  private async getSubmission(fileNumber: string) {
    const submission = await this.notificationSubmissionRepository.findOneBy({
      fileNumber,
    });

    if (!submission) {
      throw new ServiceNotFoundException(
        `Submission does not exist for provided notice of intent ${fileNumber}. Only notice of intents originated in portal have statuses.`,
      );
    }

    return submission;
  }

  async removeStatuses(submissionUuid: string) {
    const statusesToRemove = await this.getCurrentStatusesBy(submissionUuid);

    return await this.statusesRepository.remove(statusesToRemove);
  }
}
