import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationSubmissionStatusService } from '../../../application-submission-status/application-submission-status.service';
import { ApplicationSubmissionStatusType } from '../../../application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../../../application-submission-status/submission-status.dto';
import { ApplicationOwnerDto } from '../../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmissionUpdateDto } from '../../../portal/application-submission/application-submission.dto';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { filterUndefined } from '../../../utils/undefined';
import { AlcsApplicationSubmissionDto } from '../application.dto';
import { AlcsApplicationSubmissionUpdateDto } from './application-submission.dto';

@Injectable()
export class ApplicationSubmissionService {
  constructor(
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
    @InjectRepository(ApplicationSubmissionStatusType)
    private applicationStatusRepository: Repository<ApplicationSubmissionStatusType>,
    @InjectMapper() private mapper: Mapper,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
  ) {}

  async get(fileNumber: string) {
    return await this.applicationSubmissionRepository.findOneOrFail({
      where: { fileNumber, isDraft: false },
      relations: {
        naruSubtype: true,
        application: {
          documents: {
            document: true,
          },
        },
        owners: {
          type: true,
        },
      },
    });
  }

  async mapToDto(submission: ApplicationSubmission) {
    const mappedSubmission = await this.mapper.mapAsync(
      submission,
      ApplicationSubmission,
      AlcsApplicationSubmissionDto,
    );

    const primaryContact = submission.owners.find(
      (e) => e.uuid === submission.primaryContactOwnerUuid,
    );

    mappedSubmission.primaryContact = await this.mapper.mapAsync(
      primaryContact,
      ApplicationOwner,
      ApplicationOwnerDto,
    );

    return mappedSubmission;
  }

  async getStatus(code: SUBMISSION_STATUS) {
    return await this.applicationStatusRepository.findOneOrFail({
      where: {
        code,
      },
    });
  }

  async updateStatus(fileNumber: string, statusCode: SUBMISSION_STATUS) {
    //Load submission without relations to prevent save from crazy cascading
    const submission = await this.applicationSubmissionRepository.findOneOrFail(
      {
        where: {
          fileNumber: fileNumber,
        },
      },
    );

    await this.applicationSubmissionStatusService.setStatusDate(
      submission.uuid,
      statusCode,
    );
  }

  async update(
    fileNumber: string,
    updateDto: AlcsApplicationSubmissionUpdateDto,
  ) {
    //Load submission without relations to prevent save from crazy cascading
    const submission = await this.applicationSubmissionRepository.findOneOrFail(
      {
        where: {
          fileNumber: fileNumber,
        },
      },
    );

    submission.subdProposedLots = filterUndefined(
      updateDto.subProposedLots,
      submission.subdProposedLots,
    );

    await this.applicationSubmissionRepository.save(submission);
  }
}
