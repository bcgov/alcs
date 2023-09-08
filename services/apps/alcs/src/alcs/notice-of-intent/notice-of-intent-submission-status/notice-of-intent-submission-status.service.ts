import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { In, IsNull, Repository } from 'typeorm';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { SUBMISSION_STATUS } from '../../application/application-submission-status/submission-status.dto';
import { NoticeOfIntentSubmissionStatusType } from './notice-of-intent-status-type.entity';
import { NOI_SUBMISSION_STATUS } from './notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionToSubmissionStatus } from './notice-of-intent-status.entity';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class NoticeOfIntentSubmissionStatusService {
  constructor(
    @InjectRepository(NoticeOfIntentSubmissionToSubmissionStatus)
    private statusesRepository: Repository<NoticeOfIntentSubmissionToSubmissionStatus>,
    @InjectRepository(NoticeOfIntentSubmissionStatusType)
    private submissionStatusTypeRepository: Repository<NoticeOfIntentSubmissionStatusType>,
    @InjectRepository(NoticeOfIntentSubmission)
    private noticeOfIntentSubmissionRepository: Repository<NoticeOfIntentSubmission>,
  ) {}

  async setInitialStatuses(submissionUuid: string, persist = true) {
    const statuses = await this.submissionStatusTypeRepository.find();
    const newStatuses: NoticeOfIntentSubmissionToSubmissionStatus[] = [];

    for (const status of statuses) {
      const newStatus = new NoticeOfIntentSubmissionToSubmissionStatus({
        submissionUuid: submissionUuid,
        statusTypeCode: status.code,
      });

      if (newStatus.statusTypeCode === NOI_SUBMISSION_STATUS.IN_PROGRESS) {
        const date = dayjs().tz('Canada/Pacific').startOf('day').toDate();
        newStatus.effectiveDate = date;
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
    const submission = await this.noticeOfIntentSubmissionRepository.findOneBy({
      fileNumber,
    });

    if (!submission) {
      throw new ServiceNotFoundException(
        `Submission does not exist for provided notice of intent ${fileNumber}. Only notice of intents originated in portal have statuses.`,
      );
    }

    return submission;
  }

  //Note: do not use fileNumber as identifier since there maybe multiple submissions with
  //      the same fileNumber due to isDraft flag
  async removeStatuses(submissionUuid: string) {
    const statusesToRemove = await this.getCurrentStatusesBy(submissionUuid);

    return await this.statusesRepository.remove(statusesToRemove);
  }

  async getCopiedStatuses(
    sourceSubmissionUuid: string,
    destinationSubmissionUuid,
  ) {
    const statuses = await this.statusesRepository.find({
      where: { submissionUuid: sourceSubmissionUuid },
    });
    const newStatuses = statuses.map(
      (s) =>
        new NoticeOfIntentSubmissionToSubmissionStatus({
          ...s,
          submissionUuid: destinationSubmissionUuid,
        }),
    );

    return newStatuses;
  }

  async getSubmissionToSubmissionStatusForSendingEmails(date: Date) {
    return await this.statusesRepository.find({
      where: {
        statusTypeCode: In([NOI_SUBMISSION_STATUS.ALC_DECISION]),
        emailSentDate: IsNull(),
        effectiveDate: date, // this will get only statuses set for today since the status service converts all days to .startOf('day')
      },
      relations: {
        submission: true,
      },
    });
  }

  async saveSubmissionToSubmissionStatus(
    submissionStatus: NoticeOfIntentSubmissionToSubmissionStatus,
  ) {
    return await this.statusesRepository.save(submissionStatus);
  }
}
