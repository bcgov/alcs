import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { NotificationTransfereeDto } from '../../portal/notification-submission/notification-transferee/notification-transferee.dto';
import { NotificationTransferee } from '../../portal/notification-submission/notification-transferee/notification-transferee.entity';
import { OwnerType, OwnerTypeDto } from '../owner-type/owner-type.entity';

@Injectable()
export class NotificationTransfereeProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        NotificationTransferee,
        NotificationTransfereeDto,
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) => `${p.firstName} ${p.lastName}`),
        ),
      );

      createMap(mapper, OwnerType, OwnerTypeDto);
    };
  }
}
