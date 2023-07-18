import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../../../libs/common/src/exceptions/base.exception';
import { ApplicationSubmission } from '../portal/application-submission/application-submission.entity';
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

  async setInitialStatuses(submissionUuid: string) {
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

    return await this.statusesRepository.save(newStatuses);
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
}
