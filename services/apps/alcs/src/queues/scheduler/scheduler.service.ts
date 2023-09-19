import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

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
    private applicationSubmissionStatusEmailsQueue: Queue,
    @InjectQueue(QUEUES.NOTICE_OF_INTENTS_STATUS_EMAILS)
    private noticeOfIntentSubmissionStatusEmailsQueue: Queue,
  ) {}

  async setup() {
    //Job Disabled, clean queue but don't schedule it
    // TODO remove this once job is enabled
    await this.removeRepeatJobs(this.applicationExpiryQueue);
    // await this.scheduleApplicationExpiry();

    await this.scheduleCleanupNotifications();

    await this.scheduleSubmissionEmails();
  }

  private async scheduleApplicationExpiry() {
    await this.removeRepeatJobs(this.applicationExpiryQueue);
    await this.applicationExpiryQueue.add(
      'applicationExpiry',
      {},
      {
        repeat: { pattern: MONDAY_TO_FRIDAY_AT_2AM },
      },
    );
  }

  private async scheduleCleanupNotifications() {
    await this.removeRepeatJobs(this.cleanupNotificationsQueue);
    await this.cleanupNotificationsQueue.add(
      'cleanupNotifications',
      {},
      {
        repeat: { pattern: EVERYDAY_MIDNIGHT },
      },
    );
  }

  private async scheduleSubmissionEmails() {
    await this.removeRepeatJobs(this.applicationSubmissionStatusEmailsQueue);
    await this.applicationSubmissionStatusEmailsQueue.add(
      'applicationSubmissionStatusEmails',
      {},
      {
        repeat: { pattern: EVERY_15_MINUTES_STARTING_FROM_8AM },
      },
    );

    await this.removeRepeatJobs(this.noticeOfIntentSubmissionStatusEmailsQueue);
    await this.noticeOfIntentSubmissionStatusEmailsQueue.add(
      'noticeOfIntentSubmissionStatusEmails',
      {},
      { repeat: { pattern: EVERY_15_MINUTES_STARTING_FROM_8AM } },
    );
  }

  private async removeRepeatJobs(queue: Queue) {
    const repeatJobs = await queue.getRepeatableJobs();

    repeatJobs.forEach(async (job) => {
      await queue.removeRepeatableByKey(job.key);
    });
  }
}
