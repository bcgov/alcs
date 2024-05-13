import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { generateALCDNoticeOfIntentHtml } from '../../../../../../templates/emails/decision-released';
import { PARENT_TYPE } from '../../../alcs/card/card-subtask/card-subtask.dto';
import { NoticeOfIntentDecisionV2Service } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NOI_SUBMISSION_STATUS } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionService } from '../../../alcs/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import { StatusEmailService } from '../../../providers/email/status-email.service';
import { QUEUES } from '../scheduler.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Processor(QUEUES.NOTICE_OF_INTENTS_DECISION_EMAILS)
export class NoticeOfIntentDecisionEmailsConsumer extends WorkerHost {
  private logger = new Logger(NoticeOfIntentDecisionEmailsConsumer.name);

  constructor(
    private statusEmailService: StatusEmailService,
    private noiDecisionService: NoticeOfIntentDecisionV2Service,
    private noiSubmissionService: NoticeOfIntentSubmissionService,
  ) {
    super();
  }

  async process() {
    this.logger.debug('Starting NOI decision email consumer.');
    try {
      const tomorrow = dayjs(new Date())
        .tz('Canada/Pacific')
        .startOf('day')
        .add(1, 'day')
        .toDate();

      const decisions =
        await this.noiDecisionService.getDecisionsPendingEmail(tomorrow);

      for (const decision of decisions) {
        try {
          const submission = await this.noiSubmissionService.get(
            decision.noticeOfIntent.fileNumber,
          );
          const { primaryContact, submissionGovernment } =
            await this.statusEmailService.getNoticeOfIntentEmailData(
              submission,
            );

          const documents =
            await this.statusEmailService.getNoticeOfIntentDecisionDocuments(
              decision.uuid,
            );

          if (primaryContact) {
            await this.statusEmailService.sendNoticeOfIntentStatusEmail({
              generateStatusHtml: generateALCDNoticeOfIntentHtml,
              status: NOI_SUBMISSION_STATUS.ALC_DECISION,
              noticeOfIntentSubmission: submission,
              government: submissionGovernment,
              parentType: PARENT_TYPE.NOTICE_OF_INTENT,
              primaryContact,
              ccGovernment: true,
              documents,
            });

            await this.noiDecisionService.update(
              decision.uuid,
              {
                emailSent: new Date(),
              },
              undefined,
            );
            this.logger.debug(`Email sent for NOI Decision ${decision.uuid}`);
          }
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
    this.logger.debug('Completed NoticeOfIntentDecisionEmailsConsumer job.');
  }
}
