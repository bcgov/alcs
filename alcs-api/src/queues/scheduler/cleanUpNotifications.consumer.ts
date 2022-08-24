import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { NotificationService } from '../../notification/notification.service';
import { QUEUES } from './scheduler.service';

const DAYS_TO_RETAIN_READ = 30;
const DAYS_TO_RETAIN_UNREAD = 365;

@Processor(QUEUES.CLEANUP_NOTIFICATIONS)
export class CleanUpNotificationsConsumer {
  private logger = new Logger(CleanUpNotificationsConsumer.name);

  constructor(private notificationService: NotificationService) {}

  @Process()
  async cleanUpNotifications() {
    try {
      this.logger.debug('starting notification cleanup');

      const olderThanRead = dayjs()
        .add(DAYS_TO_RETAIN_READ * -1, 'days')
        .toDate();
      const readDeleteResult = await this.notificationService.cleanUp(
        olderThanRead,
      );

      const olderThanUnread = dayjs()
        .add(DAYS_TO_RETAIN_UNREAD * -1, 'days')
        .toDate();
      const unreadDeleteResult = await this.notificationService.cleanUp(
        olderThanUnread,
        false,
      );

      this.logger.debug(
        `notification cleanup complete, deleted ${
          readDeleteResult.affected + unreadDeleteResult.affected
        } records`,
      );
    } catch (e) {
      this.logger.error(e);
    }
    return;
  }
}
