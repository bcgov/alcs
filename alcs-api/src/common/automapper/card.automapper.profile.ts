import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CardDto } from '../../card/card.dto';
import { Card } from '../../card/card.entity';

@Injectable()
export class CardAutomapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        Card,
        CardDto,
        forMember(
          (cd) => cd.status,
          mapFrom((c) => c.status.code),
        ),
        forMember(
          (cd) => cd.type,
          mapFrom((c) => c.type.code),
        ),
      );
    };
  }
}
