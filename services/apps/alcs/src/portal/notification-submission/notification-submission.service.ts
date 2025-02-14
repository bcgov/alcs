import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as dayjs from 'dayjs';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { template } from '../../../../../templates/emails/notifications/srw-notice.template';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { PARENT_TYPE } from '../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import {
  NotificationDocument,
  VISIBILITY_FLAG,
} from '../../alcs/notification/notification-document/notification-document.entity';
import { NotificationDocumentService } from '../../alcs/notification/notification-document/notification-document.service';
import { NOTIFICATION_STATUS } from '../../alcs/notification/notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from '../../alcs/notification/notification-submission-status/notification-submission-status.service';
import { NotificationService } from '../../alcs/notification/notification.service';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM } from '../../document/document.dto';
import { FileNumberService } from '../../file-number/file-number.service';
import { EmailService } from '../../providers/email/email.service';
import { User } from '../../user/user.entity';
import { FALLBACK_APPLICANT_NAME } from '../../utils/owner.constants';
import { filterUndefined } from '../../utils/undefined';
import { ValidatedNotificationSubmission } from './notification-submission-validator.service';
import {
  NotificationSubmissionDetailedDto,
  NotificationSubmissionDto,
  NotificationSubmissionUpdateDto,
} from './notification-submission.dto';
import { NotificationSubmission } from './notification-submission.entity';
import { compile } from 'handlebars';

@Injectable()
export class NotificationSubmissionService {
  private logger: Logger = new Logger(NotificationSubmissionService.name);

  private DEFAULT_RELATIONS: FindOptionsRelations<NotificationSubmission> = {
    createdBy: true,
    transferees: {
      type: true,
    },
    parcels: true,
  };

  constructor(
    @InjectRepository(NotificationSubmission)
    private notificationSubmissionRepository: Repository<NotificationSubmission>,
    private notificationService: NotificationService,
    private localGovernmentService: LocalGovernmentService,
    private fileNumberService: FileNumberService,
    private notificationSubmissionStatusService: NotificationSubmissionStatusService,
    private notificationDocumentService: NotificationDocumentService,
    private emailService: EmailService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getOrFailByFileNumber(fileNumber: string) {
    return await this.notificationSubmissionRepository.findOneOrFail({
      where: {
        fileNumber,
      },
      relations: this.DEFAULT_RELATIONS,
      order: {
        transferees: {
          firstName: 'ASC',
        },
      },
    });
  }

  async create(type: string, createdBy: User) {
    const fileNumber = await this.fileNumberService.generateNextFileNumber();

    await this.notificationService.create({
      fileNumber,
      applicant: FALLBACK_APPLICANT_NAME,
      typeCode: type,
    });

    const noiSubmission = new NotificationSubmission({
      fileNumber,
      typeCode: type,
      createdBy,
    });

    const savedSubmission =
      await this.notificationSubmissionRepository.save(noiSubmission);

    await this.notificationSubmissionStatusService.setInitialStatuses(
      savedSubmission.uuid,
    );

    return fileNumber;
  }

  async update(
    submissionUuid: string,
    updateDto: NotificationSubmissionUpdateDto,
    user: User,
  ) {
    const notificationSubmission = await this.getByUuid(submissionUuid, user);

    notificationSubmission.applicant = updateDto.applicant;
    notificationSubmission.submittersFileNumber = filterUndefined(
      updateDto.submittersFileNumber,
      notificationSubmission.submittersFileNumber,
    );
    notificationSubmission.purpose = filterUndefined(
      updateDto.purpose,
      notificationSubmission.purpose,
    );
    notificationSubmission.totalArea = filterUndefined(
      updateDto.totalArea,
      notificationSubmission.totalArea,
    );
    notificationSubmission.hasSurveyPlan = filterUndefined(
      updateDto.hasSurveyPlan,
      notificationSubmission.hasSurveyPlan,
    );

    notificationSubmission.localGovernmentUuid = updateDto.localGovernmentUuid;
    notificationSubmission.contactFirstName = filterUndefined(
      updateDto.contactFirstName,
      notificationSubmission.contactFirstName,
    );
    notificationSubmission.contactLastName = filterUndefined(
      updateDto.contactLastName,
      notificationSubmission.contactLastName,
    );
    notificationSubmission.contactOrganization = filterUndefined(
      updateDto.contactOrganization,
      notificationSubmission.contactOrganization,
    );
    notificationSubmission.contactPhone = filterUndefined(
      updateDto.contactPhone,
      notificationSubmission.contactPhone,
    );
    notificationSubmission.contactEmail = filterUndefined(
      updateDto.contactEmail,
      notificationSubmission.contactEmail,
    );

    await this.notificationSubmissionRepository.save(notificationSubmission);

    if (updateDto.localGovernmentUuid) {
      await this.notificationService.update(notificationSubmission.fileNumber, {
        localGovernmentUuid: updateDto.localGovernmentUuid,
      });
    }

    return this.getByUuid(submissionUuid, user);
  }

  async getFileNumber(submissionUuid: string) {
    const submission = await this.notificationSubmissionRepository.findOne({
      where: {
        uuid: submissionUuid,
      },
      select: {
        uuid: true,
        fileNumber: true,
      },
    });
    return submission?.fileNumber;
  }

  async getUuid(fileNumber: string) {
    const submission = await this.notificationSubmissionRepository.findOne({
      where: {
        fileNumber,
      },
      select: {
        uuid: true,
        fileNumber: true,
      },
    });
    return submission?.uuid;
  }

  async getAllByUser(user: User) {
    const whereClauses = await this.generateWhereClauses({}, user);

    return this.notificationSubmissionRepository.find({
      where: whereClauses,
      order: {
        auditUpdatedAt: 'DESC',
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByFileNumber(fileNumber: string, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return await this.getOrFailByFileNumber(fileNumber);
    }

    const whereClauses = await this.generateWhereClauses(
      {
        fileNumber,
      },
      user,
    );

    return await this.notificationSubmissionRepository.findOneOrFail({
      where: whereClauses,
      order: {
        auditUpdatedAt: 'DESC',
        transferees: {
          firstName: 'ASC',
        },
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByUuid(uuid: string, user: User) {
    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      user.clientRoles!.includes(value),
    );
    if (overlappingRoles.length > 0) {
      return await this.notificationSubmissionRepository.findOneOrFail({
        where: {
          uuid,
        },
        order: {
          transferees: {
            firstName: 'ASC',
          },
        },
        relations: {
          ...this.DEFAULT_RELATIONS,
        },
      });
    }

    const findOptions = await this.generateWhereClauses(
      {
        uuid,
      },
      user,
    );

    return this.notificationSubmissionRepository.findOneOrFail({
      where: findOptions,
      relations: {
        ...this.DEFAULT_RELATIONS,
      },
      order: {
        transferees: {
          firstName: 'ASC',
        },
        auditUpdatedAt: 'DESC',
      },
    });
  }

  private async generateWhereClauses(
    searchOptions: FindOptionsWhere<NotificationSubmission>,
    user: User,
  ) {
    const searchQueries: FindOptionsWhere<NotificationSubmission>[] = [];

    searchQueries.push({
      ...searchOptions,
      createdBy: {
        uuid: user.uuid,
      },
    });

    if (user.bceidBusinessGuid) {
      searchQueries.push({
        ...searchOptions,
        createdBy: {
          bceidBusinessGuid: user.bceidBusinessGuid,
        },
      });

      const matchingLocalGovernment =
        await this.localGovernmentService.getByGuid(user.bceidBusinessGuid);
      if (matchingLocalGovernment) {
        searchQueries.push({
          ...searchOptions,
          localGovernmentUuid: matchingLocalGovernment.uuid,
          notification: {
            dateSubmittedToAlc: Not(IsNull()),
          },
        });
      }
    }

    return searchQueries;
  }

  async mapToDTOs(submissions: NotificationSubmission[], user: User) {
    const types = await this.notificationService.listTypes();

    return submissions.map((notificationSubmission) => {
      const isCreator = notificationSubmission.createdBy.uuid === user.uuid;
      const isSameAccount =
        user.bceidBusinessGuid &&
        notificationSubmission.createdBy.bceidBusinessGuid ===
          user.bceidBusinessGuid;

      return {
        ...this.mapper.map(
          notificationSubmission,
          NotificationSubmission,
          NotificationSubmissionDto,
        ),
        type: types.find(
          (type) => type.code === notificationSubmission.typeCode,
        )!.label,
        canEdit:
          [NOTIFICATION_STATUS.IN_PROGRESS].includes(
            notificationSubmission.status.statusTypeCode as NOTIFICATION_STATUS,
          ) &&
          (isCreator || isSameAccount),
        canView:
          notificationSubmission.status.statusTypeCode !==
          SUBMISSION_STATUS.CANCELLED,
      };
    });
  }

  async mapToDetailedDTO(
    notificationSubmission: NotificationSubmission,
    user: User,
  ) {
    const types = await this.notificationService.listTypes();
    const mappedApp = this.mapper.map(
      notificationSubmission,
      NotificationSubmission,
      NotificationSubmissionDetailedDto,
    );
    const isCreator = notificationSubmission.createdBy.uuid === user.uuid;
    const isSameAccount =
      user.bceidBusinessGuid &&
      notificationSubmission.createdBy.bceidBusinessGuid ===
        user.bceidBusinessGuid;

    return {
      ...mappedApp,
      type: types.find((type) => type.code === notificationSubmission.typeCode)!
        .label,
      canEdit:
        [NOTIFICATION_STATUS.IN_PROGRESS].includes(
          notificationSubmission.status.statusTypeCode as NOTIFICATION_STATUS,
        ) &&
        (isCreator || isSameAccount),
      canView:
        notificationSubmission.status.statusTypeCode !==
        SUBMISSION_STATUS.CANCELLED,
    };
  }

  async submitToAlcs(notificationSubmission: ValidatedNotificationSubmission, dateSubmitted: Date) {
    try {
      const submittedNotification = await this.notificationService.submit({
        fileNumber: notificationSubmission.fileNumber,
        applicant: notificationSubmission.applicant,
        localGovernmentUuid: notificationSubmission.localGovernmentUuid,
        typeCode: notificationSubmission.typeCode,
        dateSubmittedToAlc: dateSubmitted,
      });

      await this.notificationSubmissionStatusService.setStatusDate(
        notificationSubmission.uuid,
        NOTIFICATION_STATUS.SUBMITTED_TO_ALC,
        submittedNotification.dateSubmittedToAlc,
      );

      return submittedNotification;
    } catch (ex) {
      this.logger.error(ex);
      throw new BaseServiceException(
        `Failed to submit notification: ${notificationSubmission.fileNumber}`,
      );
    }
  }

  async updateStatus(
    uuid: string,
    statusCode: NOTIFICATION_STATUS,
    effectiveDate?: Date | null,
  ) {
    await this.notificationSubmissionStatusService.setStatusDate(
      uuid,
      statusCode,
      effectiveDate,
    );
  }

  async cancel(submission: NotificationSubmission) {
    return await this.notificationSubmissionStatusService.setStatusDate(
      submission.uuid,
      NOTIFICATION_STATUS.CANCELLED,
    );
  }

  async sendAndRecordLTSAPackage(
    submission: NotificationSubmission,
    document: NotificationDocument,
    user: User,
    dateSubmitted?: Date,
  ): Promise<boolean> {
    const templateData = await this.generateSrwEmailData(submission, document, dateSubmitted);

    const didSend = await this.emailService.sendEmail({
      to: [templateData.to],
      body: templateData.html,
      subject: `Agricultural Land Commission SRW${submission.fileNumber} (${submission.applicant})`,
      parentType: PARENT_TYPE.NOTIFICATION,
      parentId: templateData.parentId,
      triggerStatus: NOTIFICATION_STATUS.SUBMITTED_TO_ALC,
      cc: templateData.cc,
      attachments: [document.document],
    });

    if (didSend) {
      const fileBuffer = Buffer.from(templateData.html);
      await this.notificationDocumentService.attachDocumentAsBuffer({
        file: Buffer.from(templateData.html),
        fileName: `SRW${submission.fileNumber}_ALC_Email_Response.html`,
        source: DOCUMENT_SOURCE.ALC,
        user,
        system: DOCUMENT_SYSTEM.ALCS,
        documentType: DOCUMENT_TYPE.ACKNOWLEDGEMENT_LETTER,
        fileNumber: submission.fileNumber,
        fileSize: fileBuffer.length,
        mimeType: 'text/html',
        visibilityFlags: [
          VISIBILITY_FLAG.APPLICANT,
          VISIBILITY_FLAG.GOVERNMENT,
        ],
      });

      await this.updateStatus(
        submission.uuid,
        NOTIFICATION_STATUS.ALC_RESPONSE_SENT,
      );
    }

    return didSend;
  }

  private async generateSrwEmailData(
    submission: NotificationSubmission,
    pdfDocument: NotificationDocument,
    dateSubmitted?: Date,
  ) {
    const notification = await this.notificationService.getByFileNumber(
      submission.fileNumber,
    );

    const html = compile(template)({
      parentTypeLabel: 'Notification',
      fileNumber: submission.fileNumber,
      contactName: `${submission.contactFirstName} ${submission.contactLastName}`,
      status: 'ALC Response Sent',
      dateSubmitted: dayjs(dateSubmitted).format('MMMM DD, YYYY'),
      fileName: pdfDocument.document.fileName,
      submittersFileNumber: submission.submittersFileNumber!,
    });

    let ccEmails: string[] = [];
    if (submission.localGovernmentUuid) {
      const localGovernment = await this.localGovernmentService.getByUuid(
        submission.localGovernmentUuid,
      );

      if (localGovernment && localGovernment.emails) {
        ccEmails = localGovernment.emails.filter((email) => email !== '');
      }
    }

    return {
      html: html,
      cc: ccEmails,
      to: submission.contactEmail!,
      parentId: notification.uuid,
    };
  }

  async canDeleteDocument(document: NotificationDocument, user: User) {
    const documentFlags = await this.getDocumentFlags(document);

    const isOwner = user.uuid === documentFlags.ownerUuid;
    const isGovernmentOnFile =
      user.bceidBusinessGuid === documentFlags.localGovernmentGuid;
    const isSameAccountAsOwner =
      !!user.bceidBusinessGuid &&
      user.bceidBusinessGuid === documentFlags.ownerGuid;

    return isOwner || isGovernmentOnFile || isSameAccountAsOwner;
  }

  async canAccessDocument(document: NotificationDocument, user: User) {
    //If document has P, skip all checks.
    if (document.visibilityFlags.includes(VISIBILITY_FLAG.PUBLIC)) {
      return true;
    }

    const documentFlags = await this.getDocumentFlags(document);

    const applicantFlag =
      document.visibilityFlags.includes(VISIBILITY_FLAG.APPLICANT) &&
      user.uuid === documentFlags.ownerUuid;
    const governmentFlag =
      !!user.bceidBusinessGuid &&
      document.visibilityFlags.includes(VISIBILITY_FLAG.GOVERNMENT) &&
      user.bceidBusinessGuid === documentFlags.localGovernmentGuid;
    const sharedAccountFlag =
      !!user.bceidBusinessGuid &&
      document.visibilityFlags.includes(VISIBILITY_FLAG.APPLICANT) &&
      user.bceidBusinessGuid === documentFlags.ownerGuid;

    return applicantFlag || governmentFlag || sharedAccountFlag;
  }

  private async getDocumentFlags(document: NotificationDocument) {
    const result = await this.notificationSubmissionRepository
      .createQueryBuilder('submission')
      .leftJoin('submission.notification', 'notification')
      .leftJoin('notification.documents', 'document')
      .leftJoin('submission.createdBy', 'user')
      .leftJoin('notification.localGovernment', 'localGovernment')
      .select([
        'user.uuid',
        'user.bceid_business_guid',
        'localGovernment.bceidBusinessGuid',
      ])
      .where('document.uuid = :uuid', {
        uuid: document.uuid,
      })
      .execute();

    return {
      ownerUuid: result[0]?.user_uuid,
      ownerGuid: result[0]?.bceid_business_guid,
      localGovernmentGuid: result[0]?.localGovernment_bceid_business_guid,
    };
  }
}
