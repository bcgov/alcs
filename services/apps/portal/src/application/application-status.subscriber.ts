import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { InsertEvent } from 'typeorm/subscriber/event/InsertEvent';
import { Application } from './application.entity';

@EventSubscriber()
export class ApplicationStatusSubscriber implements EntitySubscriberInterface {
  constructor(private dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Application;
  }

  async beforeInsert(event: InsertEvent<Application>) {
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

  async beforeUpdate(event: UpdateEvent<Application>) {
    if (!event.entity) {
      return;
    }

    this.updateStatusHistory(event);
  }

  private updateStatusHistory(event: UpdateEvent<Application>) {
    const oldApplication = event.databaseEntity;
    const newApplication = event.entity as Application;

    //Status is set directly since the application.statusCode will still reflect the old status
    if (oldApplication.statusCode !== newApplication.status.code) {
      newApplication.statusHistory.push({
        description: newApplication.status.description,
        time: Date.now(),
        label: newApplication.status.label,
        type: 'status_change',
      });
    }
  }
}
