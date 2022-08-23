import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NotificationDto } from '../../notification/notification.dto';
import { Notification } from '../../notification/notification.entity';

@Injectable()
export class NotificationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        Notification,
        NotificationDto,
        forMember(
          (n) => n.createdAt,
          mapFrom((n) => n.createdAt.getTime()),
        ),
      );
    };
  }
}
