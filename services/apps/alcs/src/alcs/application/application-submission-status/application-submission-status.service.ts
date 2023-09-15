import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { And, In, IsNull, LessThan, Not, Repository } from 'typeorm';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionStatusType } from './submission-status-type.entity';
import { SUBMISSION_STATUS } from './submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from './submission-status.entity';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ApplicationSubmissionStatusService {
  constructor(
    @InjectRepository(ApplicationSubmissionToSubmissionStatus)
    private statusesRepository: Repository<ApplicationSubmissionToSubmissionStatus>,
    @InjectRepository(ApplicationSubmissionStatusType)
    private submissionStatusTypeRepository: Repository<ApplicationSubmissionStatusType>,
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
  ) {}

  async setInitialStatuses(submissionUuid: string, persist = true) {
    const statuses = await this.submissionStatusTypeRepository.find();
    const newStatuses: ApplicationSubmissionToSubmissionStatus[] = [];

    for (const status of statuses) {
      const newStatus = new ApplicationSubmissionToSubmissionStatus({
        submissionUuid: submissionUuid,
        statusTypeCode: status.code,
      });

      if (newStatus.statusTypeCode === SUBMISSION_STATUS.IN_PROGRESS) {
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

  async getStatusesByUuid(submissionUuid: string) {
    return await this.statusesRepository.findBy({ submissionUuid });
  }

  async getStatusesByFileNumber(fileNumber: string) {
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
    const submission = await this.applicationSubmissionRepository.findOneBy({
      fileNumber,
    });

    if (!submission) {
      throw new ServiceNotFoundException(
        `Submission does not exist for provided application ${fileNumber}. Only applications originated in portal have statuses.`,
      );
    }

    return submission;
  }

  //Note: do not use fileNumber as identifier since there maybe multiple submissions with
  //      the same fileNumber due to isDraft flag
  async removeStatuses(submissionUuid: string) {
    const statusesToRemove = await this.getStatusesByUuid(submissionUuid);

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
        new ApplicationSubmissionToSubmissionStatus({
          ...s,
          submissionUuid: destinationSubmissionUuid,
        }),
    );

    return newStatuses;
  }

  async getSubmissionToSubmissionStatusForSendingEmails(date: Date) {
    return await this.statusesRepository.find({
      where: {
        statusTypeCode: In([
          SUBMISSION_STATUS.ALC_DECISION,
          SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
        ]),
        emailSentDate: IsNull(),
        effectiveDate: And(Not(IsNull()), LessThan(date)), // this will get only statuses < today+1 since the status service converts all days to .startOf('day')
      },
      relations: {
        submission: {
          submissionStatuses: true,
        },
      },
    });
  }

  async saveSubmissionToSubmissionStatus(
    submissionStatus: ApplicationSubmissionToSubmissionStatus,
  ) {
    return await this.statusesRepository.save(submissionStatus);
  }
}
