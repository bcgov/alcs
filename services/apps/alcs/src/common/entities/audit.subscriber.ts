import { ClsService } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { UserGuids, UserService } from '../../user/user.service';
import { Auditable } from './audit.entity';

export const SYSTEM_ID = 'alcs-api';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    private dataSource: DataSource,
    private cls: ClsService,
    private userService: UserService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Auditable;
  }

  async beforeInsert(event: UpdateEvent<any>) {
    if (!event.entity) {
      return;
    }

    const userGuids = this.cls.get('userGuids');
    if (userGuids) {
      event.entity.auditCreatedBy = await this.fetchUserUuid(userGuids);
    } else {
      event.entity.auditCreatedBy = SYSTEM_ID;
    }
  }

  async beforeUpdate(event: UpdateEvent<any>) {
    if (!event.entity) {
      return;
    }

    const userGuids = this.cls.get('userGuids');
    if (userGuids) {
      event.entity.auditUpdatedBy = await this.fetchUserUuid(userGuids);
    } else {
      event.entity.auditUpdatedBy = SYSTEM_ID;
    }
  }

  private async fetchUserUuid(guids: UserGuids) {
    const user = await this.userService.getByGuid(guids);
    if (!user) {
      throw new Error('User not found from token! Has their email changed?');
    }
    return user.uuid;
  }
}
