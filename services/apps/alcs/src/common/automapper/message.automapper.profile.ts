import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { MessageDto } from '../../alcs/message/message.dto';
import { Message } from '../../alcs/message/message.entity';

@Injectable()
export class MessageProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        Message,
        MessageDto,
        forMember(
          (n) => n.createdAt,
          mapFrom((n) => n.createdAt.getTime()),
        ),
      );
    };
  }
}
