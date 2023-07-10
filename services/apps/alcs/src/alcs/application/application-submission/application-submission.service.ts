import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationOwnerDto } from '../../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { SubmissionStatusType } from '../../../portal/application-submission/submission-status/submission-status-type.entity';
import { APPLICATION_STATUS } from '../../../portal/application-submission/submission-status/submission-status.dto';
import { AlcsApplicationSubmissionDto } from '../application.dto';

@Injectable()
export class ApplicationSubmissionService {
  constructor(
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
    @InjectRepository(SubmissionStatusType)
    private applicationStatusRepository: Repository<SubmissionStatusType>,
    @InjectMapper() private mapper: Mapper,
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

  async getStatus(code: APPLICATION_STATUS) {
    return await this.applicationStatusRepository.findOneOrFail({
      where: {
        code,
      },
    });
  }

  async updateStatus(fileNumber: string, statusCode: APPLICATION_STATUS) {
    const status = await this.getStatus(statusCode);

    //Load submission without relations to prevent save from crazy cascading
    const submission = await this.applicationSubmissionRepository.findOneOrFail(
      {
        where: {
          fileNumber: fileNumber,
        },
      },
    );

    // TODO status
    // submission.status = status;

    //Use save to trigger subscriber
    await this.applicationSubmissionRepository.save(submission);
  }
}
