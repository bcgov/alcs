import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    // return newStatuses;
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

  async getCurrentStatusesBy(submissionUuid: string) {
    return await this.statusesRepository.findBy({ submissionUuid });
  }
}
