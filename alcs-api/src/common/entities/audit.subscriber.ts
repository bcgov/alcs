import { ClsService } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { UserService } from '../../user/user.service';
import { Base } from './base.entity';

export const SYSTEM_ID = 'alcs-api';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    private dataSource: DataSource,
    private readonly cls: ClsService,
    private userService: UserService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Base;
  }

  async beforeInsert(event: UpdateEvent<any>) {
    const userEmail = this.cls.get('userEmail');
    if (userEmail) {
      event.entity.auditCreatedBy = await this.fetchUserUuid(userEmail);
    } else {
      event.entity.auditCreatedBy = SYSTEM_ID;
    }
  }

  async beforeUpdate(event: UpdateEvent<any>) {
    const userEmail = this.cls.get('userEmail');
    if (userEmail) {
      event.entity.auditUpdatedBy = await this.fetchUserUuid(userEmail);
    } else {
      event.entity.auditUpdatedBy = SYSTEM_ID;
    }
  }

  private async fetchUserUuid(userEmail: string) {
    const user = await this.userService.getUser(userEmail);
    if (!user) {
      throw new Error('User not found from token! Has their email changed?');
    }
    return user.uuid;
  }
}
