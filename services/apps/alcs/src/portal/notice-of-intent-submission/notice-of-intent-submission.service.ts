import {
  BaseServiceException,
  ServiceNotFoundException,
} from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NOI_SUBMISSION_STATUS } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { filterUndefined } from '../../utils/undefined';
import {
  NoticeOfIntentSubmissionDetailedDto,
  NoticeOfIntentSubmissionDto,
  NoticeOfIntentSubmissionUpdateDto,
} from './notice-of-intent-submission.dto';
import { NoticeOfIntentSubmission } from './notice-of-intent-submission.entity';

@Injectable()
export class NoticeOfIntentSubmissionService {
  private logger: Logger = new Logger(NoticeOfIntentSubmissionService.name);

  private DEFAULT_RELATIONS: FindOptionsRelations<NoticeOfIntentSubmission> = {
    //TODO
  };

  constructor(
    @InjectRepository(NoticeOfIntentSubmission)
    private noticeOfIntentSubmissionRepository: Repository<NoticeOfIntentSubmission>,
    private noticeOfIntentService: NoticeOfIntentService,
    private localGovernmentService: LocalGovernmentService,
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private fileNumberService: FileNumberService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getOrFailByFileNumber(fileNumber: string) {
    const noticeOfIntent =
      await this.noticeOfIntentSubmissionRepository.findOne({
        where: {
          fileNumber,
          isDraft: false,
        },
        relations: this.DEFAULT_RELATIONS,
      });
    if (!noticeOfIntent) {
      throw new Error('Failed to find notice of intent submission');
    }
    return noticeOfIntent;
  }

  async getOrFailByUuid(
    uuid: string,
    relations: FindOptionsRelations<NoticeOfIntentSubmission> = {},
  ) {
    const noticeOfIntent =
      await this.noticeOfIntentSubmissionRepository.findOne({
        where: {
          uuid,
        },
        relations,
      });
    if (!noticeOfIntent) {
      throw new Error('Failed to find submission');
    }
    return noticeOfIntent;
  }

  async create(type: string, createdBy: User) {
    const fileNumber = await this.fileNumberService.generateNextFileNumber();

    await this.noticeOfIntentService.create({
      fileNumber,
      applicant: 'Unknown',
      typeCode: type,
    });

    const noiSubmission = new NoticeOfIntentSubmission({
      fileNumber,
      typeCode: type,
      createdBy,
    });

    const savedSubmission = await this.noticeOfIntentSubmissionRepository.save(
      noiSubmission,
    );

    await this.noticeOfIntentSubmissionStatusService.setInitialStatuses(
      savedSubmission.uuid,
    );

    return fileNumber;
  }

  async update(
    submissionUuid: string,
    updateDto: NoticeOfIntentSubmissionUpdateDto,
  ) {
    const noticeOfIntentSubmission = await this.getOrFailByUuid(submissionUuid);

    noticeOfIntentSubmission.applicant = updateDto.applicant;
    noticeOfIntentSubmission.purpose = filterUndefined(
      updateDto.purpose,
      noticeOfIntentSubmission.purpose,
    );
    noticeOfIntentSubmission.typeCode =
      updateDto.typeCode || noticeOfIntentSubmission.typeCode;
    noticeOfIntentSubmission.localGovernmentUuid =
      updateDto.localGovernmentUuid;

    await this.noticeOfIntentSubmissionRepository.save(
      noticeOfIntentSubmission,
    );

    if (!noticeOfIntentSubmission.isDraft && updateDto.localGovernmentUuid) {
      await this.noticeOfIntentService.update(
        noticeOfIntentSubmission.fileNumber,
        {
          localGovernmentUuid: updateDto.localGovernmentUuid,
        },
      );
    }

    return this.getOrFailByUuid(submissionUuid, this.DEFAULT_RELATIONS);
  }

  //TODO: Uncomment when adding submitting
  // async submitToAlcs(
  //   application: ValidatedApplicationSubmission,
  //   user: User,
  //   applicationReview?: ApplicationSubmissionReview,
  // ) {
  //   let submittedApp: Application | null = null;
  //
  //   const shouldCreateCard = applicationReview?.isAuthorized ?? true;
  //   try {
  //     submittedApp = await this.noticeOfIntentService.submit(
  //       {
  //         fileNumber: application.fileNumber,
  //         applicant: application.applicant,
  //         localGovernmentUuid: application.localGovernmentUuid,
  //         typeCode: application.typeCode,
  //         dateSubmittedToAlc: new Date(),
  //       },
  //       shouldCreateCard,
  //     );
  //
  //     await this.updateStatus(
  //       application,
  //       SUBMISSION_STATUS.SUBMITTED_TO_ALC,
  //       submittedApp.dateSubmittedToAlc,
  //     );
  //
  //     this.generateAndAttachPdfs(
  //       application.fileNumber,
  //       user,
  //       !!applicationReview,
  //     );
  //   } catch (ex) {
  //     this.logger.error(ex);
  //     throw new BaseServiceException(
  //       `Failed to submit application: ${application.fileNumber}`,
  //     );
  //   }
  //
  //   return submittedApp;
  // }
  //
  // private async generateAndAttachPdfs(
  //   fileNumber: string,
  //   user: User,
  //   hasReview: boolean,
  // ) {
  //   try {
  //     await this.submissionDocumentGenerationService.generateAndAttach(
  //       fileNumber,
  //       user,
  //     );
  //
  //     if (hasReview) {
  //       await this.generateReviewDocumentService.generateAndAttach(
  //         fileNumber,
  //         user,
  //       );
  //     }
  //   } catch (e) {
  //     this.logger.error(`Error generating the document on submission${e}`);
  //   }
  // }

  async getByUser(user: User) {
    const searchQueries: FindOptionsWhere<NoticeOfIntentSubmission>[] = [];

    searchQueries.push({
      createdBy: {
        uuid: user.uuid,
      },
      isDraft: false,
    });

    if (user.bceidBusinessGuid) {
      searchQueries.push({
        createdBy: {
          bceidBusinessGuid: user.bceidBusinessGuid,
        },
        isDraft: false,
      });

      const matchingLocalGovernment =
        await this.localGovernmentService.getByGuid(user.bceidBusinessGuid);
      if (matchingLocalGovernment) {
        searchQueries.push({
          localGovernmentUuid: matchingLocalGovernment.uuid,
          isDraft: false,
          //TODO: Test this once we can submit NOIs
          submissionStatuses: {
            effectiveDate: Not(IsNull()),
            statusTypeCode: Not(NOI_SUBMISSION_STATUS.IN_PROGRESS),
          },
        });
      }
    }

    return this.noticeOfIntentSubmissionRepository.find({
      where: searchQueries,
      order: {
        auditUpdatedAt: 'DESC',
      },
    });
  }

  async getByFileNumber(fileNumber: string, user: User) {
    return await this.noticeOfIntentSubmissionRepository.findOne({
      where: {
        fileNumber,
        createdBy: {
          uuid: user.uuid,
        },
        isDraft: false,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByUuid(uuid: string) {
    return await this.noticeOfIntentSubmissionRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        ...this.DEFAULT_RELATIONS,
        createdBy: true,
      },
    });
  }

  async getIfCreatorByFileNumber(fileNumber: string, user: User) {
    const noiSubmission = await this.getByFileNumber(fileNumber, user);
    if (!noiSubmission) {
      throw new ServiceNotFoundException(
        `Failed to load notice of intent submission with File ID ${fileNumber}`,
      );
    }
    return noiSubmission;
  }

  async getIfCreatorByUuid(uuid: string, user: User) {
    const noiSubmission = await this.getByUuid(uuid);
    if (!noiSubmission || noiSubmission.createdBy.uuid !== user.uuid) {
      throw new ServiceNotFoundException(
        `Failed to load notice of intent submission with ID ${uuid}`,
      );
    }
    return noiSubmission;
  }

  async verifyAccessByFileId(fileId: string, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return await this.noticeOfIntentSubmissionRepository.findOneOrFail({
        where: {
          fileNumber: fileId,
          isDraft: false,
        },
        relations: this.DEFAULT_RELATIONS,
      });
    }

    return await this.getIfCreatorByFileNumber(fileId, user);
  }

  async verifyAccessByUuid(submissionUuid: string, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return await this.noticeOfIntentSubmissionRepository.findOneOrFail({
        where: {
          uuid: submissionUuid,
        },
        relations: {
          ...this.DEFAULT_RELATIONS,
        },
      });
    }

    return await this.getIfCreatorByUuid(submissionUuid, user);
  }

  async mapToDTOs(apps: NoticeOfIntentSubmission[]) {
    const types = await this.noticeOfIntentService.listTypes();

    return apps.map((app) => {
      return {
        ...this.mapper.map(
          app,
          NoticeOfIntentSubmission,
          NoticeOfIntentSubmissionDto,
        ),
        type: types.find((type) => type.code === app.typeCode)!.label,
        canEdit: true, //TODO
        canView: true, //TODO
      };
    });
  }

  async mapToDetailedDTO(noiSubmission: NoticeOfIntentSubmission) {
    const types = await this.noticeOfIntentService.listTypes();
    const mappedApp = this.mapper.map(
      noiSubmission,
      NoticeOfIntentSubmission,
      NoticeOfIntentSubmissionDetailedDto,
    );
    return {
      ...mappedApp,
      type: types.find((type) => type.code === noiSubmission.typeCode)!.label,
      canEdit: true,
      canView: true,
    };
  }

  async submitToAlcs(noticeOfIntent: NoticeOfIntentSubmission) {
    try {
      const submittedNoi = await this.noticeOfIntentService.submit({
        fileNumber: noticeOfIntent.fileNumber,
        applicant: noticeOfIntent.applicant!, //TODO: Remove ! once validation is implemented
        localGovernmentUuid: noticeOfIntent.localGovernmentUuid!,
        typeCode: noticeOfIntent.typeCode,
        dateSubmittedToAlc: new Date(),
      });

      await this.noticeOfIntentSubmissionStatusService.setStatusDate(
        submittedNoi.uuid,
        NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
        submittedNoi.dateSubmittedToAlc,
      );

      return submittedNoi;
    } catch (ex) {
      this.logger.error(ex);
      throw new BaseServiceException(
        `Failed to submit notice of intent: ${noticeOfIntent.fileNumber}`,
      );
    }
  }

  async updateStatus(
    uuid: string,
    statusCode: NOI_SUBMISSION_STATUS,
    effectiveDate?: Date | null,
  ) {
    const submission = await this.loadBarebonesSubmission(uuid);
    await this.noticeOfIntentSubmissionStatusService.setStatusDate(
      submission.uuid,
      statusCode,
      effectiveDate,
    );
  }

  async cancel(noticeOfIntentSubmission: NoticeOfIntentSubmission) {
    return await this.noticeOfIntentSubmissionStatusService.setStatusDate(
      noticeOfIntentSubmission.uuid,
      NOI_SUBMISSION_STATUS.CANCELLED,
    );
  }

  private loadBarebonesSubmission(uuid: string) {
    //Load submission without relations to prevent save from crazy cascading
    return this.noticeOfIntentSubmissionRepository.findOneOrFail({
      where: {
        uuid,
      },
    });
  }
}
