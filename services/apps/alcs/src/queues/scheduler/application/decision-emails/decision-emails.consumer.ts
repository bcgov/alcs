import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { template as alcdApplicationTemplate } from '../../../../../../../templates/emails/decision-released/application.template';
import { template as revaTemplate } from '../../../../../../../templates/emails/under-review-by-alc.template';
import { ApplicationDecisionV2Service } from '../../../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';
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

@Processor(QUEUES.APPLICATION_DECISION_EMAILS)
export class ApplicationDecisionEmailConsumer extends WorkerHost {
  private logger = new Logger(ApplicationDecisionEmailConsumer.name);

  constructor(
    private submissionStatusService: ApplicationSubmissionStatusService,
    private appDecisionService: ApplicationDecisionV2Service,
    private statusEmailService: StatusEmailService,
  ) {
    super();
  }

  async process() {
    try {
      this.logger.debug('Starting application decision email consumer.');

      const tomorrow = dayjs(new Date())
        .tz('Canada/Pacific')
        .startOf('day')
        .add(1, 'day')
        .toDate();

      const decisions =
        await this.appDecisionService.getDecisionsPendingEmail(tomorrow);

      for (const decision of decisions) {
        try {
          const {
            applicationSubmission,
            primaryContact,
            submissionGovernment,
          } = await this.statusEmailService.getApplicationEmailData(
            decision.application.fileNumber,
          );

          const submissionStatus =
            await this.submissionStatusService.getCurrentStatusByFileNumber(
              decision.application.fileNumber,
            );

          await this.sendEmail(
            applicationSubmission,
            submissionGovernment,
            primaryContact,
            submissionStatus,
            decision.uuid,
            decision.ccEmails,
          );

          await this.appDecisionService.update(
            decision.uuid,
            {
              isDraft: false,
              emailSent: new Date(),
            },
            undefined,
            undefined,
          );
          this.logger.debug(
            `Email sent for Application Decision ${decision.uuid}`,
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
    this.logger.debug('Completed ApplicationDecisionEmailConsumer job.');
  }

  private async sendEmail(
    applicationSubmission: ApplicationSubmission,
    submissionGovernment: LocalGovernment | null,
    primaryContact: ApplicationOwner | undefined,
    submissionStatus: ApplicationSubmissionToSubmissionStatus,
    decisionUuid: string,
    ccEmails: string[],
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
        await this.statusEmailService.getApplicationDecisionDocuments(
          decisionUuid,
        );

      await this.statusEmailService.sendApplicationStatusEmail({
        applicationSubmission,
        government: submissionGovernment,
        parentType: PARENT_TYPE.APPLICATION,
        primaryContact,
        ccGovernment: true,
        template,
        status: <SUBMISSION_STATUS>submissionStatus.statusTypeCode,
        documents,
        ccEmails,
      });
    }
  }
}
