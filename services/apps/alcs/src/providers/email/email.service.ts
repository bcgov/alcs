import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MJMLParseResults } from 'mjml-core';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { EmailStatus } from './email-status.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { SUBMISSION_STATUS } from '../../application-submission-status/submission-status.dto';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmissionService } from '../../portal/application-submission/application-submission.service';
import { ApplicationService } from '../../alcs/application/application.service';

export interface StatusUpdateEmail {
  fileNumber: string;
  applicantName: string;
  status: string;
  applicationType: string;
  governmentName: string;
}

type StatusEmailData = {
  generateStatusHtml: MJMLParseResults;
  status: SUBMISSION_STATUS;
  applicationSubmission: ApplicationSubmission;
  localGovernment: ApplicationLocalGovernment;
  primaryContact?: ApplicationOwner;
};

@Injectable()
export class EmailService {
  private logger: Logger = new Logger(EmailService.name);

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private httpService: HttpService,
    @InjectRepository(EmailStatus)
    private repository: Repository<EmailStatus>,
    private localGovernmentService: ApplicationLocalGovernmentService,
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
  }: {
    to: string[];
    body: string;
    subject: string;
    cc?: string[];
    bcc?: string[];
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

  async sendStatusEmail(data: StatusEmailData) {
    const status = await this.applicationSubmissionService.getStatus(
      data.status,
    );

    const types = await this.applicationService.fetchApplicationTypes();

    const matchingType = types.find(
      (type) => type.code === data.applicationSubmission.typeCode,
    );

    const fileNumber = data.applicationSubmission.fileNumber;
    const applicantName = data.applicationSubmission.applicant || 'Unknown';

    const emailTemplate = data.generateStatusHtml({
      fileNumber,
      applicantName,
      applicationType:
        matchingType?.portalLabel ?? matchingType?.label ?? 'Unknown',
      governmentName: data.localGovernment.name,
      status: status.label,
    });

    if (data.primaryContact && data.primaryContact.email) {
      // Send to owner
      this.sendEmail({
        body: emailTemplate.html,
        subject: `Agricultural Land Commission Application ID: ${fileNumber} (${applicantName})`,
        to: [data.primaryContact.email],
      });
    } else if (data.localGovernment.emails.length > 0) {
      // Send to government
      data.localGovernment.emails.forEach((email) => {
        this.sendEmail({
          body: emailTemplate.html,
          subject: `Agricultural Land Commission Application ID: ${fileNumber} (${applicantName})`,
          to: [email],
        });
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
