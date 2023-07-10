import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { STATUS_CODES } from 'http';
import { Repository } from 'typeorm';
import { ApplicationSubmission } from '../application-submission.entity';
import { SubmissionStatusType } from './submission-status-type.entity';
import { ApplicationSubmissionToSubmissionStatus } from './submission-status.entity';

@Injectable()
export class ApplicationSubmissionStatusService {
  constructor(
    @InjectRepository(ApplicationSubmissionToSubmissionStatus)
    private statusesRepository: Repository<ApplicationSubmissionToSubmissionStatus>,
    @InjectRepository(ApplicationSubmission)
    private submissionRepository: Repository<ApplicationSubmission>,
    @InjectRepository(SubmissionStatusType)
    private submissionStatusTypeRepository: Repository<SubmissionStatusType>,
  ) {}

  async getInitialStatuses() {
    const statuses = await this.submissionStatusTypeRepository.find();
    const newStatuses: ApplicationSubmissionToSubmissionStatus[] = [];

    for (const status of statuses) {
      const newStatus = new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: status.code,
      });

      if (newStatus.statusTypeCode === STATUS_CODES.IN_PROGRESS) {
        newStatus.effectiveDate = new Date();
      }

      newStatuses.push(newStatus);
    }

    return newStatuses;
  }

  async update(
    submissionUuid: string,
    statusTypeCode: string,
    effectiveDate: Date,
  ) {
    const status = await this.statusesRepository.findOneOrFail({
      where: {
        submissionUuid,
        statusTypeCode,
      },
    });

    status.effectiveDate = effectiveDate;

    return this.statusesRepository.save(status);
  }
}
