import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BoardStatus } from '../../board/board-status.entity';
import { BoardDto, BoardStatusDto } from '../../board/board.dto';
import { Board } from '../../board/board.entity';

@Injectable()
export class BoardAutomapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, Board, BoardDto);
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
    };
  }
}
