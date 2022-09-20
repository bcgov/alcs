import { ClsService } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { Card } from '../card/card.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CardHistory } from './application-history.entity';

@EventSubscriber()
export class CardSubscriber implements EntitySubscriberInterface<Card> {
  constructor(
    private dataSource: DataSource,
    private cls: ClsService,
    private userService: UserService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Card;
  }

  async beforeUpdate(event: UpdateEvent<Card>) {
    const oldApplication = event.databaseEntity;
    const newApplication = event.entity as Card;

    const userEmail = this.cls.get('userEmail');
    const user = await this.userService.get(userEmail);
    if (!user) {
      throw new Error('User not found from token! Has their email changed?');
    }

    await this.trackHistory(oldApplication, newApplication, event, user);
  }

  private async trackHistory(
    oldApplication: Card,
    newApplication: Card,
    event: UpdateEvent<Card>,
    user: User,
  ) {
    if (oldApplication.statusUuid !== newApplication.statusUuid) {
      const history = new CardHistory();
      history.startDate =
        oldApplication.auditUpdatedAt || oldApplication.auditCreatedAt;
      history.endDate = new Date(1, 1, 1, 1, 1, 1, 1);
      history.statusUuid = oldApplication.statusUuid;
      history.card = event.databaseEntity;
      history.userId = user.uuid;
      history.auditCreatedBy = user.uuid;

      await event.manager.save(history);
    }
  }
}
