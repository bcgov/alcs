import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { isDST } from '../../utils/pacific-date-time-helper';

export const MONDAY_TO_FRIDAY_AT_2AM_PST_IN_UTC = '0 0 10 * * 1-5';
export const MONDAY_TO_FRIDAY_AT_2AM_PDT_IN_UTC = '0 0 9 * * 1-5';

export const EVERYDAY_MIDNIGHT_PST_IN_UTC = '0 0 8 * * *';
export const EVERYDAY_MIDNIGHT_PDT_IN_UTC = '0 0 7 * * *';

export const EVERY_15_MINUTES_STARTING_FROM_8AM_PST_IN_UTC =
  '0/15 16-23,0-6 * * *';
export const EVERY_15_MINUTES_STARTING_FROM_8AM_PDT_IN_UTC =
  '0/15 15-23,0-5 * * *';

export const QUEUES = {
  APP_EXPIRY: 'ApplicationExpiry',
  CLEANUP_NOTIFICATIONS: 'CleanupNotifications',
  APPLICATION_STATUS_EMAILS: 'ApplicationSubmissionStatusEmails',
  APPLICATION_DECISION_EMAILS: 'ApplicationDecisionEmails',
  NOTICE_OF_INTENTS_DECISION_EMAILS: 'NoticeOfIntentDecisionEmails',
};

@Injectable()
export class SchedulerService {
  constructor(
    @InjectQueue(QUEUES.APP_EXPIRY) private applicationExpiryQueue: Queue,
    @InjectQueue(QUEUES.CLEANUP_NOTIFICATIONS)
    private cleanupNotificationsQueue: Queue,
    @InjectQueue(QUEUES.APPLICATION_STATUS_EMAILS)
    private applicationSubmissionStatusEmailsQueue: Queue,
    @InjectQueue(QUEUES.NOTICE_OF_INTENTS_DECISION_EMAILS)
    private noticeOfIntentDecisionEmailsQueue: Queue,
    @InjectQueue(QUEUES.APPLICATION_DECISION_EMAILS)
    private applicationDecisionEmailsQueue: Queue,
  ) {}

  async setup() {
    //Job Disabled, clean queue but don't schedule it
    // TODO remove this once job is enabled
    await this.removeRepeatJobs(this.applicationExpiryQueue);
    // await this.scheduleApplicationExpiry();

    await this.scheduleCleanupNotifications();
    await this.scheduleSubmissionEmails();
    await this.scheduleDecisionEmails();
  }

  private async scheduleApplicationExpiry() {
    await this.removeRepeatJobs(this.applicationExpiryQueue);
    await this.applicationExpiryQueue.add(
      'applicationExpiry',
      {},
      {
        repeat: {
          pattern: this.getCronExpressionBasedOnDst(
            MONDAY_TO_FRIDAY_AT_2AM_PST_IN_UTC,
            MONDAY_TO_FRIDAY_AT_2AM_PDT_IN_UTC,
          ),
        },
      },
    );
  }

  private async scheduleCleanupNotifications() {
    await this.removeRepeatJobs(this.cleanupNotificationsQueue);
    await this.cleanupNotificationsQueue.add(
      'cleanupNotifications',
      {},
      {
        repeat: {
          pattern: this.getCronExpressionBasedOnDst(
            EVERYDAY_MIDNIGHT_PST_IN_UTC,
            EVERYDAY_MIDNIGHT_PDT_IN_UTC,
          ),
        },
      },
    );
  }

  private async scheduleSubmissionEmails() {
    const cronExpression = this.getCronExpressionBasedOnDst(
      EVERY_15_MINUTES_STARTING_FROM_8AM_PST_IN_UTC,
      EVERY_15_MINUTES_STARTING_FROM_8AM_PDT_IN_UTC,
    );
    await this.removeRepeatJobs(this.applicationSubmissionStatusEmailsQueue);
    await this.applicationSubmissionStatusEmailsQueue.add(
      'applicationSubmissionStatusEmails',
      {},
      {
        repeat: {
          pattern: cronExpression,
        },
      },
    );
  }

  private async scheduleDecisionEmails() {
    const cronExpression = this.getCronExpressionBasedOnDst(
      EVERY_15_MINUTES_STARTING_FROM_8AM_PST_IN_UTC,
      EVERY_15_MINUTES_STARTING_FROM_8AM_PDT_IN_UTC,
    );

    await this.removeRepeatJobs(this.applicationDecisionEmailsQueue);
    await this.applicationDecisionEmailsQueue.add(
      'applicationDecisionEmails',
      {},
      { repeat: { pattern: cronExpression } },
    );

    await this.removeRepeatJobs(this.noticeOfIntentDecisionEmailsQueue);
    await this.noticeOfIntentDecisionEmailsQueue.add(
      'noticeOfIntentDecisionEmails',
      {},
      { repeat: { pattern: cronExpression } },
    );
  }

  private async removeRepeatJobs(queue: Queue) {
    const repeatJobs = await queue.getRepeatableJobs();

    repeatJobs.forEach(async (job) => {
      await queue.removeRepeatableByKey(job.key);
    });
  }

  private getCronExpressionBasedOnDst(
    pstCronExpression: string,
    pdtCronExpression: string,
  ) {
    return isDST() ? pdtCronExpression : pstCronExpression;
  }
}
