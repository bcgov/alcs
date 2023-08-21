import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MJMLParseResults } from 'mjml-core';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { EmailStatus } from './email-status.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmissionService } from '../../portal/application-submission/application-submission.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { FALLBACK_APPLICANT_NAME } from '../../utils/owner.constants';
import { ParentType } from '../../common/dtos/base.dto';

export interface StatusUpdateEmail {
  fileNumber: string;
  applicantName: string;
  status: string;
  applicationType: string;
  governmentName: string;
  parentType: ParentType;
}

type StatusEmailData = {
  generateStatusHtml: MJMLParseResults;
  status: SUBMISSION_STATUS;
  applicationSubmission: ApplicationSubmission;
  government: LocalGovernment | null;
  parentType: ParentType;
  primaryContact?: ApplicationOwner;
  ccGovernment?: boolean;
  decisionReleaseMaskedDate?: string;
};

export const appFees = [
  { type: 'Exclusion', fee: 750 },
  { type: 'Subdivision', fee: 750 },
  { type: 'Non-Farm Use', fee: 750 },
  { type: 'Non-Adhering Residential Use', fee: 450 },
  { type: 'Soil or Fill Use', fee: 750 },
  { type: 'Inclusion', fee: 0 },
];

const parentTypeLabel: {
  [key in ParentType.Application | ParentType.NoticeOfIntent]: string;
} = {
  application: 'Application',
  'notice-of-intent': 'NOI',
};

@Injectable()
export class EmailService {
  private logger: Logger = new Logger(EmailService.name);

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private httpService: HttpService,
    @InjectRepository(EmailStatus)
    private repository: Repository<EmailStatus>,
    private localGovernmentService: LocalGovernmentService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationService: ApplicationService,
  ) {}

  private token = '';
  private tokenExpiry = 0;

  private async fetchToken() {
    const targetUrl = this.config.get<string>('CHES.TOKEN_URL');
    const username = this.config.get<string>('CHES.SERVICE_CLIENT');
    const password = this.config.get<string>('CHES.PASSWORD');

    const res = await firstValueFrom(
      this.httpService.post(
        targetUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        {
          auth: {
            username,
            password,
          },
        },
      ),
    );

    this.token = res.data.access_token;
    this.tokenExpiry = Date.now() + res.data.expires_in - 1;

    return this.token;
  }

  private async getToken() {
    if (this.tokenExpiry < Date.now()) {
      return this.fetchToken();
    } else {
      return this.token;
    }
  }

  async sendEmail({
    to,
    body,
    subject,
    cc = [],
    bcc = [],
    parentType,
    parentId,
    triggerStatus,
  }: {
    to: string[];
    body: string;
    subject: string;
    cc?: string[];
    bcc?: string[];
    parentType?: string;
    parentId?: string;
    triggerStatus?: string;
  }) {
    const serviceUrl = this.config.get<string>('CHES.URL');
    const from = this.config.get<string>('CHES.FROM');
    const token = await this.getToken();

    try {
      if (this.config.get<string>('CHES.MODE') !== 'production') {
        this.logger.log(
          { to, body, subject, cc, bcc },
          'EmailService did not send the email. Set CHES.MODE to production if you need to send an email.',
        );
        return;
      }
      const res = await firstValueFrom(
        this.httpService.post<{
          txId: string;
          messages: {
            msgId: string;
            tag: string;
            to: string[];
          }[];
        }>(
          `${serviceUrl}/api/v1/email`,
          {
            bodyType: 'html',
            body,
            from,
            subject,
            to,
            cc,
            bcc,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
      this.logger.debug({ to, from, subject }, `Email sent`);
      this.repository.save(
        new EmailStatus({
          recipients: [...to, ...cc, ...bcc].join(', '),
          status: 'success',
          transactionId: res.data.txId,
          parentType,
          parentId,
          triggerStatus,
        }),
      );
    } catch (e) {
      this.logger.error(e, 'Failed to Send Email');

      let errorMessage = e.message;
      if (e.response) {
        errorMessage = e.response.data.detail;
      }

      this.repository.save(
        new EmailStatus({
          recipients: [...to, ...cc, ...bcc].join(', '),
          status: 'failed',
          errors: errorMessage,
          parentType,
          parentId,
          triggerStatus,
        }),
      );
    }
  }

  async getSubmissionGovernmentOrFail(submission: ApplicationSubmission) {
    const submissionGovernment = await this.getSubmissionGovernment(submission);
    if (!submissionGovernment) {
      throw new NotFoundException('Submission local government not found');
    }
    return submissionGovernment;
  }

  private async getSubmissionGovernment(submission: ApplicationSubmission) {
    if (submission.localGovernmentUuid) {
      const localGovernment = await this.localGovernmentService.getByUuid(
        submission.localGovernmentUuid,
      );
      if (localGovernment) {
        return localGovernment;
      }
    }
    return undefined;
  }

  async getSubmissionStatusEmailData(
    fileNumber: string,
    submissionData?: ApplicationSubmission,
  ) {
    const applicationSubmission =
      submissionData ||
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

  async sendStatusEmail(data: StatusEmailData) {
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
      applicationType:
        matchingType?.portalLabel ??
        matchingType?.label ??
        FALLBACK_APPLICANT_NAME,
      governmentName: data.government?.name,
      status: status.label,
      parentTypeLabel: parentTypeLabel[data.parentType],
      decisionReleaseMaskedDate: data?.decisionReleaseMaskedDate,
    });

    const parentId = await this.applicationService.getUuid(fileNumber);

    const email = {
      body: emailTemplate.html,
      subject: `Agricultural Land Commission Application ID: ${fileNumber} (${applicantName})`,
      parentType: data.parentType,
      parentId,
      triggerStatus: status.code,
    };

    if (data.primaryContact && data.primaryContact.email) {
      this.sendEmail({
        ...email,
        to: [data.primaryContact.email],
        cc: data.ccGovernment ? data.government?.emails : [],
      });
    } else if (data.government && data.government.emails.length > 0) {
      this.sendEmail({
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
