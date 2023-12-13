import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MJMLParseResults } from 'mjml-core';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationService } from '../../alcs/application/application.service';
import { PARENT_TYPE } from '../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NOI_SUBMISSION_STATUS } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../../portal/application-submission/application-submission.service';
import { NoticeOfIntentOwner } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.service';
import { FALLBACK_APPLICANT_NAME } from '../../utils/owner.constants';
import { EmailService } from './email.service';
import { ApplicationDecisionV2Service } from '../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';

export interface StatusUpdateEmail {
  fileNumber: string;
  applicantName: string;
  status: string;
  childType: string;
  governmentName: string;
  parentType: PARENT_TYPE;
}

export type DocumentEmailData = {
  name: string;
  url: string;
};

type BaseStatusEmailData = {
  generateStatusHtml: MJMLParseResults;
  government: LocalGovernment | null;
  parentType: PARENT_TYPE;
  ccGovernment?: boolean;
  documents?: DocumentEmailData[];
};

type ApplicationEmailData = BaseStatusEmailData & {
  applicationSubmission: ApplicationSubmission;
  status: SUBMISSION_STATUS;
  primaryContact?: ApplicationOwner;
};

type NoticeOfIntentEmailData = BaseStatusEmailData & {
  noticeOfIntentSubmission: NoticeOfIntentSubmission;
  status: NOI_SUBMISSION_STATUS;
  primaryContact?: NoticeOfIntentOwner;
};

const parentTypeLabel: Record<
  PARENT_TYPE.APPLICATION | PARENT_TYPE.NOTICE_OF_INTENT,
  string
> = {
  application: 'Application',
  'notice-of-intent': 'NOI',
};

@Injectable()
export class StatusEmailService {
  private logger: Logger = new Logger(StatusEmailService.name);

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private localGovernmentService: LocalGovernmentService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationService: ApplicationService,
    private noticeOfIntentService: NoticeOfIntentService,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private emailService: EmailService,
    private applicationDecisionService: ApplicationDecisionV2Service,
  ) {}

  async getSubmissionGovernmentOrFail(
    submission: ApplicationSubmission | NoticeOfIntentSubmission,
  ) {
    const submissionGovernment = await this.getSubmissionGovernment(submission);
    if (!submissionGovernment) {
      throw new NotFoundException('Submission local government not found');
    }
    return submissionGovernment;
  }

  private async getSubmissionGovernment(
    submission: ApplicationSubmission | NoticeOfIntentSubmission,
  ) {
    if (submission.localGovernmentUuid) {
      return await this.localGovernmentService.getByUuid(
        submission.localGovernmentUuid,
      );
    }
    return undefined;
  }

  async getApplicationEmailData(
    fileNumber: string,
    submission?: ApplicationSubmission,
  ) {
    const applicationSubmission =
      submission ||
      (await this.applicationSubmissionService.getOrFailByFileNumber(
        fileNumber,
      ));

    const primaryContact = applicationSubmission.owners?.find(
      (owner) => owner.uuid === applicationSubmission.primaryContactOwnerUuid,
    );

    const submissionGovernment = applicationSubmission.localGovernmentUuid
      ? await this.getSubmissionGovernmentOrFail(applicationSubmission)
      : null;

    return { applicationSubmission, primaryContact, submissionGovernment };
  }

  async getNoticeOfIntentEmailData(submission: NoticeOfIntentSubmission) {
    const primaryContact = submission.owners?.find(
      (owner) => owner.uuid === submission.primaryContactOwnerUuid,
    );

    const submissionGovernment = submission.localGovernmentUuid
      ? await this.getSubmissionGovernmentOrFail(submission)
      : null;

    return { primaryContact, submissionGovernment };
  }

  async getApplicationDocumentEmailData(fileNumber: string) {
    const decisions =
      await this.applicationDecisionService.getByAppFileNumber(fileNumber);

    const documents = decisions
      .sort(
        (a, b) => new Date(b.date!).valueOf() - new Date(a.date!).valueOf(),
      )[0]
      .documents.map((doc) => {
        const baseUrl = this.config.get<string>('ALCS.BASE_URL');
        const controller = 'public/application/decision';
        const endpoint = 'email';

        const url = `${baseUrl}/${controller}/${doc.uuid}/${endpoint}`;

        return {
          name: doc.document.fileName,
          url,
        };
      });

    return documents;
  }

  private async getApplicationEmailTemplate(data: ApplicationEmailData) {
    const status = await this.applicationSubmissionService.getStatus(
      data.status,
    );

    const types = await this.applicationService.fetchApplicationTypes();

    const matchingType = types.find(
      (type) => type.code === data.applicationSubmission.typeCode,
    );

    const fileNumber = data.applicationSubmission.fileNumber;
    const applicantName =
      data.applicationSubmission.applicant || FALLBACK_APPLICANT_NAME;

    const emailTemplate = data.generateStatusHtml({
      fileNumber,
      applicantName,
      childType:
        matchingType?.portalLabel ??
        matchingType?.label ??
        FALLBACK_APPLICANT_NAME,
      governmentName: data.government?.name,
      status: status.label,
      parentTypeLabel: parentTypeLabel[data.parentType],
      documents: data.documents,
    });

    const parentId = await this.applicationService.getUuid(fileNumber);

    return {
      body: emailTemplate.html,
      subject: `Agricultural Land Commission Application ID: ${fileNumber} (${applicantName})`,
      parentType: data.parentType,
      parentId,
      triggerStatus: status.code,
    };
  }

  private async getNoticeOfIntentEmailTemplate(data: NoticeOfIntentEmailData) {
    const status = await this.noticeOfIntentSubmissionService.getStatus(
      data.status,
    );

    const types = await this.noticeOfIntentService.listTypes();

    const matchingType = types.find(
      (type) => type.code === data.noticeOfIntentSubmission.typeCode,
    );

    const fileNumber = data.noticeOfIntentSubmission.fileNumber;

    const applicantName =
      data.noticeOfIntentSubmission.applicant || FALLBACK_APPLICANT_NAME;

    const emailTemplate = data.generateStatusHtml({
      fileNumber,
      applicantName,
      childType:
        matchingType?.portalLabel ??
        matchingType?.label ??
        FALLBACK_APPLICANT_NAME,
      governmentName: data.government?.name,
      status: status.label,
      parentTypeLabel: parentTypeLabel[data.parentType],
    });

    const parentId = await this.noticeOfIntentService.getUuid(fileNumber);

    return {
      body: emailTemplate.html,
      subject: `Agricultural Land Commission NOI ID: ${fileNumber} (${applicantName})`,
      parentType: data.parentType,
      parentId,
      triggerStatus: status.code,
    };
  }

  async sendApplicationStatusEmail(data: ApplicationEmailData) {
    const email = await this.getApplicationEmailTemplate(data);

    this.sendStatusEmail(data, email);
  }

  async sendNoticeOfIntentStatusEmail(data: NoticeOfIntentEmailData) {
    const email = await this.getNoticeOfIntentEmailTemplate(data);

    await this.sendStatusEmail(data, email);
  }

  private async sendStatusEmail(
    data: ApplicationEmailData | NoticeOfIntentEmailData,
    email,
  ) {
    if (data.primaryContact && data.primaryContact.email) {
      await this.emailService.sendEmail({
        ...email,
        to: [data.primaryContact.email],
        cc: data.ccGovernment ? data.government?.emails : [],
      });
    } else if (data.government && data.government.emails.length > 0) {
      await this.emailService.sendEmail({
        ...email,
        to: data.government.emails,
      });
    } else {
      this.logger.warn(
        `Cannot send status email, ${
          data.primaryContact?.email ? 'primary contact' : 'local government'
        } has no email`,
      );
    }
  }
}
