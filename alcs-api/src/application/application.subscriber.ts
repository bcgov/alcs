import { ClsService } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ApplicationHistory } from './application-history.entity';
import { Application } from './application.entity';

@EventSubscriber()
export class ApplicationSubscriber
  implements EntitySubscriberInterface<Application>
{
  constructor(
    private dataSource: DataSource,
    private cls: ClsService,
    private userService: UserService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Application;
  }

  async beforeUpdate(event: UpdateEvent<Application>) {
    const oldApplication = event.databaseEntity;
    const newApplication = event.entity as Application;

    const userEmail = this.cls.get('userEmail');
    const user = await this.userService.get(userEmail);
    if (!user) {
      throw new Error('User not found from token! Has their email changed?');
    }

    await this.trackHistory(oldApplication, newApplication, event, user);
  }

  private async trackHistory(
    oldApplication: Application,
    newApplication: Application,
    event: UpdateEvent<Application>,
    user: User,
  ) {
    if (oldApplication.statusUuid !== newApplication.statusUuid) {
      const history = new ApplicationHistory();
      history.startDate =
        oldApplication.auditUpdatedAt || oldApplication.auditCreatedAt;
      history.endDate = new Date(1, 1, 1, 1, 1, 1, 1);
      history.statusUuid = oldApplication.statusUuid;
      history.application = event.databaseEntity;
      history.userId = user.uuid;
      history.auditCreatedBy = user.uuid;

      await event.manager.save(history);
    }
  }
}
