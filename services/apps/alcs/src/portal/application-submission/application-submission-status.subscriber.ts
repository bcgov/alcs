import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { InsertEvent } from 'typeorm/subscriber/event/InsertEvent';
import { ApplicationSubmission } from './application-submission.entity';

@EventSubscriber()
export class ApplicationSubmissionStatusSubscriber
  implements EntitySubscriberInterface
{
  constructor(private dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return ApplicationSubmission;
  }

  async beforeInsert(event: InsertEvent<ApplicationSubmission>) {
    if (!event.entity) {
      return;
    }

    event.entity.statusHistory = [
      {
        description: event.entity.status.description,
        time: Date.now(),
        label: event.entity.status.label,
        type: 'status_change',
      },
    ];
  }

  async beforeUpdate(event: UpdateEvent<ApplicationSubmission>) {
    if (!event.entity) {
      return;
    }

    this.updateStatusHistory(event);
  }

  private updateStatusHistory(event: UpdateEvent<ApplicationSubmission>) {
    const oldApplication = event.databaseEntity as
      | ApplicationSubmission
      | undefined;
    const newApplication = event.entity as ApplicationSubmission | undefined;

    //Status is set directly since the application.statusCode will still reflect the old status
    if (
      oldApplication &&
      newApplication &&
      oldApplication?.statusCode !== newApplication?.status.code
    ) {
      newApplication.statusHistory.push({
        description: newApplication.status.description,
        time: Date.now(),
        label: newApplication.status.label,
        type: 'status_change',
      });
    }
  }
}
