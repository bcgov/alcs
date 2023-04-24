import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationOwnerDto } from '../../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationOwner } from '../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { SubmittedApplicationDto } from '../application.dto';

@Injectable()
export class ApplicationSubmissionService {
  constructor(
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async get(fileNumber: string) {
    return await this.applicationSubmissionRepository.findOneOrFail({
      where: { fileNumber, isDraft: false },
      relations: {
        application: {
          documents: {
            document: true,
          },
        },
        parcels: {
          owners: {
            type: true,
          },
          certificateOfTitle: {
            document: true,
          },
          ownershipType: true,
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
      SubmittedApplicationDto,
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
}
