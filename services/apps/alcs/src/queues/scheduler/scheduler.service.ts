import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

export const MONDAY_TO_FRIDAY_AT_2AM = '0 0 2 * * 1-5';
export const EVERYDAY_MIDNIGHT = '0 0 0 * * *';
export const EVERY_15_MINUTES_STARTING_FROM_8AM = '0/15 8-23 * * *';

export const QUEUES = {
  APP_EXPIRY: 'ApplicationExpiry',
  CLEANUP_NOTIFICATIONS: 'CleanupNotifications',
  APPLICATION_STATUS_EMAILS: 'ApplicationSubmissionStatusEmails',
  NOTICE_OF_INTENTS_STATUS_EMAILS: 'NoticeOfIntentSubmissionStatusEmails',
};

@Injectable()
export class SchedulerService {
  constructor(
    @InjectQueue(QUEUES.APP_EXPIRY) private applicationExpiryQueue: Queue,
    @InjectQueue(QUEUES.CLEANUP_NOTIFICATIONS)
    private cleanupNotificationsQueue: Queue,
    @InjectQueue(QUEUES.APPLICATION_STATUS_EMAILS)
    private applicationSubmissionStatusEmails: Queue,
    @InjectQueue(QUEUES.NOTICE_OF_INTENTS_STATUS_EMAILS)
    private noticeOfIntentSubmissionStatusEmails: Queue,
  ) {}

  async setup() {
    //Job Disabled, clean queue but don't schedule it
    await this.applicationExpiryQueue.empty();
    // await this.scheduleApplicationExpiry();

    await this.scheduleCleanupNotifications();

    await this.scheduleSubmissionEmails();
  }

  private async scheduleApplicationExpiry() {
    await this.applicationExpiryQueue.empty();
    await this.applicationExpiryQueue.add(
      {},
      { repeat: { cron: MONDAY_TO_FRIDAY_AT_2AM } },
    );
  }

  private async scheduleCleanupNotifications() {
    await this.cleanupNotificationsQueue.empty();
    await this.cleanupNotificationsQueue.add(
      {},
      { repeat: { cron: EVERYDAY_MIDNIGHT } },
    );
  }

  private async scheduleSubmissionEmails() {
    await this.applicationSubmissionStatusEmails.empty();
    await this.applicationSubmissionStatusEmails.add(
      {},
      { repeat: { cron: EVERY_15_MINUTES_STARTING_FROM_8AM } },
    );

    await this.noticeOfIntentSubmissionStatusEmails.empty();
    await this.noticeOfIntentSubmissionStatusEmails.add(
      {},
      { repeat: { cron: EVERY_15_MINUTES_STARTING_FROM_8AM } },
    );
  }
}
