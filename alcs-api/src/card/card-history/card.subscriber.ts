import { ClsService } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { Card } from '../card.entity';

import { CardHistory } from './card-history.entity';

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

    const userGuids = this.cls.get('userGuids');
    const user = await this.userService.getByGuid(userGuids);
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
    if (oldApplication.statusCode !== newApplication.statusCode) {
      const history = new CardHistory();
      history.startDate =
        oldApplication.auditUpdatedAt || oldApplication.auditCreatedAt;
      history.endDate = new Date();
      history.statusCode = oldApplication.statusCode;
      history.card = event.databaseEntity;
      history.userId = user.uuid;
      history.auditCreatedBy = user.uuid;

      await event.manager.save(history);
    }
  }
}
