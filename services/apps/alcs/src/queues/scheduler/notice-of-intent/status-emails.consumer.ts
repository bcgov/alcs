import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { generateALCDNoticeOfIntentHtml } from '../../../../../../templates/emails/decision-released';
import { PARENT_TYPE } from '../../../alcs/card/card-subtask/card-subtask.dto';
import { NOI_SUBMISSION_STATUS } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntentSubmissionStatusService } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { StatusEmailService } from '../../../providers/email/status-email.service';
import { QUEUES } from '../scheduler.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Processor(QUEUES.NOTICE_OF_INTENTS_STATUS_EMAILS)
export class NoticeOfIntentSubmissionStatusEmailConsumer extends WorkerHost {
  private logger = new Logger(NoticeOfIntentSubmissionStatusEmailConsumer.name);

  constructor(
    private submissionStatusService: NoticeOfIntentSubmissionStatusService,
    private statusEmailService: StatusEmailService,
  ) {
    super();
  }

  async process() {
    try {
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
          const { primaryContact, submissionGovernment } =
            await this.statusEmailService.getNoticeOfIntentEmailData(
              submissionStatus.submission,
            );

          if (primaryContact) {
            await this.statusEmailService.sendNoticeOfIntentStatusEmail({
              generateStatusHtml: generateALCDNoticeOfIntentHtml,
              status: NOI_SUBMISSION_STATUS.ALC_DECISION,
              noticeOfIntentSubmission: submissionStatus.submission,
              government: submissionGovernment,
              parentType: PARENT_TYPE.NOTICE_OF_INTENT,
              primaryContact,
              ccGovernment: true,
            });

            await this.updateSubmissionStatus(submissionStatus, tomorrow);
            this.logger.debug(
              `Status email sent for NOI {submissionStatus.submissionUuid}`,
            );
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
    this.logger.debug(
      'Completed NoticeOfIntentSubmissionStatusEmailConsumer job.',
    );
  }

  private async updateSubmissionStatus(
    submissionStatus: NoticeOfIntentSubmissionToSubmissionStatus,
    today: Date,
  ) {
    submissionStatus.emailSentDate = today;
    await this.submissionStatusService.saveSubmissionToSubmissionStatus(
      submissionStatus,
    );
  }
}
