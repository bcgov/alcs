import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { template as alcdApplicationTemplate } from '../../../../../../../templates/emails/decision-released/application.template';
import { template as revaTemplate } from '../../../../../../../templates/emails/under-review-by-alc.template';
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
export class ApplicationSubmissionStatusEmailConsumer extends WorkerHost {
  private logger = new Logger(ApplicationSubmissionStatusEmailConsumer.name);

  constructor(
    private submissionStatusService: ApplicationSubmissionStatusService,
    private statusEmailService: StatusEmailService,
  ) {
    super();
  }

  async process() {
    try {
      this.logger.debug(
        'Starting application submission status email consumer.',
      );

      const tomorrow = dayjs(new Date())
        .tz('Canada/Pacific')
        .startOf('day')
        .add(1, 'day')
        .toDate();

      const submissionStatuses =
        await this.submissionStatusService.getSubmissionToSubmissionStatusForSendingEmails(
          tomorrow,
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
          );
        } catch (e) {
          this.logger.error(e);
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    this.logger.debug(
      'Completed ApplicationSubmissionStatusEmailConsumer job.',
    );
  }

  private async sendEmailAndUpdateStatus(
    applicationSubmission: ApplicationSubmission,
    submissionGovernment: LocalGovernment | null,
    primaryContact: ApplicationOwner | undefined,
    submissionStatus: ApplicationSubmissionToSubmissionStatus,
  ) {
    if (
      primaryContact &&
      applicationSubmission.status.statusTypeCode ===
        submissionStatus.statusTypeCode
    ) {
      const template =
        submissionStatus.statusTypeCode === SUBMISSION_STATUS.ALC_DECISION
          ? alcdApplicationTemplate
          : revaTemplate;

      const documents =
        submissionStatus.statusTypeCode === SUBMISSION_STATUS.ALC_DECISION
          ? await this.getDecisionDocuments(applicationSubmission.fileNumber)
          : [];

      await this.statusEmailService.sendApplicationStatusEmail({
        applicationSubmission,
        government: submissionGovernment,
        parentType: PARENT_TYPE.APPLICATION,
        primaryContact,
        ccGovernment: true,
        template,
        status: <SUBMISSION_STATUS>submissionStatus.statusTypeCode,
        documents,
        ccEmails: [],
      });

      await this.updateSubmissionStatus(submissionStatus);
      this.logger.debug(
        `Status email sent for Application {submissionStatus.submissionUuid} status code: {submissionStatus.statusTypeCode}`,
      );
    }
  }

  private async updateSubmissionStatus(
    submissionStatus: ApplicationSubmissionToSubmissionStatus,
  ) {
    const today = dayjs(new Date())
      .tz('Canada/Pacific')
      .startOf('day')
      .toDate();

    submissionStatus.emailSentDate = today;
    await this.submissionStatusService.saveSubmissionToSubmissionStatus(
      submissionStatus,
    );
  }

  private async getDecisionDocuments(fileNumber: string) {
    return this.statusEmailService.getApplicationDecisionDocuments(fileNumber);
  }
}
