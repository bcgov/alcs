import { ClsService } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { UserService } from '../../user/user.service';

export const SYSTEM_ID = 'alcs-api';

@EventSubscriber()
export class UpdatedBySubscriber implements EntitySubscriberInterface {
  constructor(
    dataSource: DataSource,
    private readonly cls: ClsService,
    private userService: UserService,
  ) {
    dataSource.subscribers.push(this);
  }

  async beforeInsert(event: UpdateEvent<any>) {
    if ('auditCreatedBy' in event.entity) {
      const userEmail = this.cls.get('userEmail');
      if (userEmail) {
        const user = await this.userService.getUser(userEmail);
        if (!user) {
          throw new Error(
            'User not found from token! Has their email changed?',
          );
        }

        event.entity.auditCreatedBy = user.uuid;
      } else {
        event.entity.auditCreatedBy = SYSTEM_ID;
      }
    }
  }

  async beforeUpdate(event: UpdateEvent<any>) {
    if ('auditUpdatedBy' in event.entity) {
      const userEmail = this.cls.get('userEmail');
      if (userEmail) {
        const user = await this.userService.getUser(userEmail);
        if (!user) {
          throw new Error(
            'User not found from token! Has their email changed?',
          );
        }

        event.entity.auditUpdatedBy = user.uuid;
      } else {
        event.entity.auditCreatedBy = SYSTEM_ID;
      }
    }
  }
}
