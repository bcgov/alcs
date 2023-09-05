import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NotificationTypeDto } from '../../alcs/notification/notification-type/notification-type.dto';
import { NotificationType } from '../../alcs/notification/notification-type/notification-type.entity';
import { NotificationDto } from '../../alcs/notification/notification.dto';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentTypeDto } from '../../document/document.dto';
import { Notification } from '../../alcs/notification/notification.entity';

@Injectable()
export class NotificationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, NotificationType, NotificationTypeDto);

      createMap(
        mapper,
        Notification,
        NotificationDto,
        forMember(
          (a) => a.dateSubmittedToAlc,
          mapFrom((ad) => ad.dateSubmittedToAlc?.getTime()),
        ),
      );

      createMap(mapper, DocumentCode, DocumentTypeDto);
    };
  }
}
