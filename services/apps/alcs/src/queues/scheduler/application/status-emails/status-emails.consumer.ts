import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { generateALCDApplicationHtml } from '../../../../../../../templates/emails/decision-released';
import { generateREVAHtml } from '../../../../../../../templates/emails/under-review-by-alc.template';
import { ApplicationSubmissionStatusService } from '../../../../alcs/application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../../../alcs/application/application-submission-status/submission-status.entity';
import { PARENT_TYPE } from '../../../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { ApplicationOwner } from '../../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../../portal/application-submission/application-submission.entity';
import { StatusEmailService } from '../../../../providers/email/status-email.service';
import { QUEUES } from '../../scheduler.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Processor(QUEUES.APPLICATION_STATUS_EMAILS)
export class ApplicationSubmissionStatusEmailConsumer {
  private logger = new Logger(ApplicationSubmissionStatusEmailConsumer.name);

  constructor(
    private submissionStatusService: ApplicationSubmissionStatusService,
    private statusEmailService: StatusEmailService,
  ) {}

  @Process()
  async processSubmissionStatusesAndSendEmails() {
    try {
      const today = dayjs(new Date())
        .tz('Canada/Pacific')
        .startOf('day')
        .toDate();

      const submissionStatuses =
        await this.submissionStatusService.getSubmissionToSubmissionStatusForSendingEmails(
          today,
        );

      for (const submissionStatus of submissionStatuses) {
        try {
          const {
            applicationSubmission,
            primaryContact,
            submissionGovernment,
          } = await this.statusEmailService.getApplicationEmailData(
            submissionStatus.submission.fileNumber,
          );

          await this.sendEmailAndUpdateStatus(
            applicationSubmission,
            submissionGovernment,
            primaryContact,
            submissionStatus,
            today,
          );
        } catch (e) {
          this.logger.error(e);
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async sendEmailAndUpdateStatus(
    applicationSubmission: ApplicationSubmission,
    submissionGovernment: LocalGovernment | null,
    primaryContact: ApplicationOwner | undefined,
    submissionStatus: ApplicationSubmissionToSubmissionStatus,
    today: Date,
  ) {
    if (
      primaryContact &&
      [
        SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
        SUBMISSION_STATUS.ALC_DECISION,
      ].includes(<SUBMISSION_STATUS>submissionStatus.statusTypeCode)
    ) {
      const generateStatusHtml =
        submissionStatus.statusTypeCode === SUBMISSION_STATUS.ALC_DECISION
          ? generateALCDApplicationHtml
          : generateREVAHtml;

      await this.statusEmailService.sendApplicationStatusEmail({
        applicationSubmission,
        government: submissionGovernment,
        parentType: PARENT_TYPE.APPLICATION,
        primaryContact,
        ccGovernment: true,
        generateStatusHtml,
        status: <SUBMISSION_STATUS>submissionStatus.statusTypeCode,
      });

      await this.updateSubmissionStatus(submissionStatus, today);
      this.logger.debug(
        `Status email sent for Application {submissionStatus.submissionUuid} status code: {submissionStatus.statusTypeCode}`,
      );
    }
  }

  private async updateSubmissionStatus(
    submissionStatus: ApplicationSubmissionToSubmissionStatus,
    today: Date,
  ) {
    submissionStatus.emailSentDate = today;
    await this.submissionStatusService.saveSubmissionToSubmissionStatus(
      submissionStatus,
    );
  }
}
