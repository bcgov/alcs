import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentOwnerDto } from '../../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwner } from '../../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionStatusType } from '../notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NOI_SUBMISSION_STATUS } from '../notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from '../notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { AlcsNoticeOfIntentSubmissionDto } from '../notice-of-intent.dto';

@Injectable()
export class NoticeOfIntentSubmissionService {
  constructor(
    @InjectRepository(NoticeOfIntentSubmission)
    private noiSubmissionRepository: Repository<NoticeOfIntentSubmission>,
    @InjectRepository(NoticeOfIntentSubmissionStatusType)
    private noiStatusRepository: Repository<NoticeOfIntentSubmissionStatusType>,
    @InjectMapper() private mapper: Mapper,
    private noiSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
  ) {}

  async get(fileNumber: string) {
    return await this.noiSubmissionRepository.findOneOrFail({
      where: { fileNumber, isDraft: false },
      relations: {
        noticeOfIntent: {
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

  async mapToDto(submission: NoticeOfIntentSubmission) {
    const mappedSubmission = await this.mapper.mapAsync(
      submission,
      NoticeOfIntentSubmission,
      AlcsNoticeOfIntentSubmissionDto,
    );

    const primaryContact = submission.owners.find(
      (e) => e.uuid === submission.primaryContactOwnerUuid,
    );

    mappedSubmission.primaryContact = await this.mapper.mapAsync(
      primaryContact,
      NoticeOfIntentOwner,
      NoticeOfIntentOwnerDto,
    );

    return mappedSubmission;
  }

  async getStatus(code: NOI_SUBMISSION_STATUS) {
    return await this.noiStatusRepository.findOneOrFail({
      where: {
        code,
      },
    });
  }

  async updateStatus(fileNumber: string, statusCode: NOI_SUBMISSION_STATUS) {
    const submission = await this.loadBarebonesSubmission(fileNumber);
    await this.noiSubmissionStatusService.setStatusDate(
      submission.uuid,
      statusCode,
    );
  }

  public loadBarebonesSubmission(fileNumber: string) {
    //Load submission without relations to prevent save from crazy cascading
    return this.noiSubmissionRepository.findOneOrFail({
      where: {
        fileNumber,
      },
    });
  }
}
