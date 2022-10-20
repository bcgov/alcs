import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  CardStatusDto,
  CardTypeDto,
} from '../../card/card-status/card-status.dto';
import { CardStatus } from '../../card/card-status/card-status.entity';
import { CardType } from '../../card/card-type/card-type.entity';
import { CardDetailedDto, CardDto } from '../../card/card.dto';
import { Card } from '../../card/card.entity';
import { AssigneeDto } from '../../user/user.dto';
import { User } from '../../user/user.entity';

@Injectable()
export class CardProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, CardStatus, CardStatusDto);
      createMap(mapper, CardStatusDto, CardStatus);
      createMap(mapper, CardType, CardTypeDto);
      createMap(mapper, CardTypeDto, CardType);

      createMap(
        mapper,
        Card,
        CardDto,
        forMember(
          (cd) => cd.type,
          mapFrom((c) => c.type.code),
        ),
        forMember(
          (cd) => cd.createdAt,
          mapFrom((c) => c.createdAt.getTime()),
        ),
        forMember(
          (ad) => ad.assignee,
          mapFrom((a) => this.mapper.map(a.assignee, User, AssigneeDto)),
        ),
      );

      createMap(
        mapper,
        Card,
        CardDetailedDto,
        forMember(
          (cd) => cd.type,
          mapFrom((c) => c.type.code),
        ),
        forMember(
          (ad) => ad.statusDetails,
          mapFrom((a) => this.mapper.map(a.status, CardStatus, CardStatusDto)),
        ),
        forMember(
          (ad) => ad.typeDetails,
          mapFrom((a) => this.mapper.map(a.type, CardType, CardTypeDto)),
        ),
      );
    };
  }
}
