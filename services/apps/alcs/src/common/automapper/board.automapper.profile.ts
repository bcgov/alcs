import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BoardStatus } from '../../alcs/board/board-status.entity';
import {
  BoardDto,
  BoardSmallDto,
  BoardStatusDto,
} from '../../alcs/board/board.dto';
import { Board } from '../../alcs/board/board.entity';
import { CardStatusDto } from '../../alcs/card/card-status/card-status.dto';
import { CardStatus } from '../../alcs/card/card-status/card-status.entity';
import { CardDto } from '../../alcs/card/card.dto';
import { Card } from '../../alcs/card/card.entity';

@Injectable()
export class BoardAutomapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, Board, BoardSmallDto);

      createMap(
        mapper,
        Board,
        BoardDto,
        forMember(
          (ad) => ad.statuses,
          mapFrom((a) =>
            this.mapper.mapArray(a.statuses, BoardStatus, BoardStatusDto),
          ),
        ),
        forMember(
          (ad) => ad.allowedCardTypes,
          mapFrom((a) => a.allowedCardTypes.map((cardType) => cardType.code)),
        ),
      );

      createMap(
        mapper,
        BoardStatus,
        BoardStatusDto,
        forMember(
          (ad) => ad.label,
          mapFrom((a) => a.status.label),
        ),
        forMember(
          (ad) => ad.statusCode,
          mapFrom((a) => a.status.code),
        ),
      );

      createMap(
        mapper,
        Card,
        CardDto,
        forMember(
          (cd) => cd.status,
          mapFrom((c) => this.mapper.map(c.status, CardStatus, CardStatusDto)),
        ),
        forMember(
          (cd) => cd.type,
          mapFrom((c) => c.type.code),
        ),
      );
    };
  }
}
