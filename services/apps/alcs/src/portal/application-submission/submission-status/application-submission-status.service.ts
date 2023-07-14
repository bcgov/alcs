import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { ApplicationSubmission } from '../application-submission.entity';
import { SubmissionStatusType } from './submission-status-type.entity';
import { SUBMISSION_STATUS } from './submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from './submission-status.entity';

@Injectable()
export class ApplicationSubmissionStatusService {
  constructor(
    @InjectRepository(ApplicationSubmissionToSubmissionStatus)
    private statusesRepository: Repository<ApplicationSubmissionToSubmissionStatus>,
    @InjectRepository(SubmissionStatusType)
    private submissionStatusTypeRepository: Repository<SubmissionStatusType>,
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
        const date = new Date();
        date.setHours(0, 0, 0, 0);
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
    date.setHours(0, 0, 0, 0);

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
