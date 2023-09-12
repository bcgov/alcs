import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardSubtask } from '../../card/card-subtask/card-subtask.entity';
import { NOTIFICATION_STATUS } from '../notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from '../notification-submission-status/notification-submission-status.service';
import { Notification } from '../notification.entity';
import { NotificationService } from '../notification.service';

export interface TimelineEvent {
  htmlText: string;
  startDate: number;
  fulfilledDate: number | null;
  isFulfilled: boolean;
  link?: string | null;
}

@Injectable()
export class NotificationTimelineService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private noticeOfIntentService: NotificationService,
    private noticeOfIntentSubmissionStatusService: NotificationSubmissionStatusService,
  ) {}

  async getTimelineEvents(fileNumber: string) {
    const events: TimelineEvent[] = [];
    const notification = await this.notificationRepo.findOneOrFail({
      where: {
        fileNumber,
      },
      relations: {
        card: {
          type: true,
          subtasks: {
            type: true,
          },
        },
      },
      withDeleted: true,
    });
    await this.addStatusEvents(notification, events);

    if (notification.card) {
      for (const subtask of notification.card.subtasks) {
        const mappedEvent = this.mapSubtaskToEvent(subtask);
        events.push(mappedEvent);
      }
    }

    events.sort((a, b) => b.startDate - a.startDate);
    return events;
  }

  private mapSubtaskToEvent(subtask: CardSubtask): TimelineEvent {
    return {
      htmlText: `${subtask.type.label} Subtask`,
      fulfilledDate: subtask.completedAt?.getTime() ?? null,
      startDate: subtask.createdAt.getTime(),
      isFulfilled: !!subtask.completedAt,
    };
  }

  private async addStatusEvents(
    notification: Notification,
    events: TimelineEvent[],
  ) {
    const statusHistory =
      await this.noticeOfIntentSubmissionStatusService.getCurrentStatusesByFileNumber(
        notification.fileNumber,
      );

    for (const status of statusHistory) {
      if (status.effectiveDate) {
        let htmlText = `<strong>${status.statusType.label}</strong>`;

        if (status.statusType.code === NOTIFICATION_STATUS.IN_PROGRESS) {
          htmlText = 'Created - <strong>In Progress</strong>';
        }

        events.push({
          htmlText,
          startDate: status.effectiveDate.getTime() + status.statusType.weight,
          fulfilledDate: null,
          isFulfilled: true,
        });
      }
    }
  }
}
