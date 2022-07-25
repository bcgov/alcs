import { ClsService } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { UserService } from '../user/user.service';
import { ApplicationHistory } from './application-history.entity';
import { Application } from './application.entity';

@EventSubscriber()
export class ApplicationSubscriber
  implements EntitySubscriberInterface<Application>
{
  constructor(
    dataSource: DataSource,
    private readonly cls: ClsService,
    private userService: UserService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Application;
  }

  async beforeUpdate(event: UpdateEvent<Application>) {
    const oldApplication = event.databaseEntity;
    const newApplication = event.entity;

    const userEmail = this.cls.get('userEmail');
    const user = await this.userService.getUser(userEmail);
    if (!user) {
      throw new Error('User not found from token! Has their email changed?');
    }

    if (oldApplication.statusUuid !== newApplication.statusUuid) {
      const history = new ApplicationHistory();
      history.startDate =
        oldApplication.auditUpdatedAt || oldApplication.auditCreatedAt;
      history.endDate = Date.now();
      history.statusUuid = oldApplication.statusUuid;
      history.application = event.databaseEntity;
      history.userId = user.uuid;

      await event.manager.save(history);
    }
  }
}
