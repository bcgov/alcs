import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Repository } from 'typeorm';
import { ApplicationOwnerDto } from '../../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { CovenantTransferee } from '../../../portal/application-submission/covenant-transferee/covenant-transferee.entity';
import { filterUndefined } from '../../../utils/undefined';
import { ApplicationSubmissionStatusService } from '../application-submission-status/application-submission-status.service';
import { ApplicationSubmissionStatusType } from '../application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../application-submission-status/submission-status.dto';
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
    @InjectRepository(CovenantTransferee)
    private covenantTransfereeRepository: Repository<CovenantTransferee>,
    @InjectRepository(ApplicationOwner)
    private applicationOwnerRepository: Repository<ApplicationOwner>,
  ) {}

  async get(fileNumber: string) {
    const submission = await this.applicationSubmissionRepository.findOneOrFail(
      {
        where: { fileNumber, isDraft: false },
        relations: {
          naruSubtype: true,
          application: {
            documents: {
              document: true,
            },
          },
        },
      },
    );

    // owners retrieved separately for performance reasons
    submission.owners = await this.applicationOwnerRepository.find({
      where: { applicationSubmissionUuid: submission.uuid },
      relations: {
        type: true,
      },
    });

    return submission;
  }

  async getTransferees(fileNumber: string) {
    return this.covenantTransfereeRepository.find({
      where: {
        applicationSubmission: {
          fileNumber,
          isDraft: false,
        },
      },
      relations: {
        type: true,
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
    const submission = await this.loadBarebonesSubmission(fileNumber);
    await this.applicationSubmissionStatusService.setStatusDate(
      submission.uuid,
      statusCode,
    );
  }

  async update(
    fileNumber: string,
    updateDto: AlcsApplicationSubmissionUpdateDto,
  ) {
    const submission = await this.loadBarebonesSubmission(fileNumber);
    submission.subdProposedLots = filterUndefined(
      updateDto.subProposedLots,
      submission.subdProposedLots,
    );
    submission.returnedToLfngComment = filterUndefined(
      updateDto.returnComment,
      submission.returnedToLfngComment,
    );

    await this.applicationSubmissionRepository.save(submission);
  }

  private loadBarebonesSubmission(fileNumber: string) {
    //Load submission without relations to prevent save from crazy cascading
    return this.applicationSubmissionRepository.findOneOrFail({
      where: {
        fileNumber,
      },
    });
  }
}
