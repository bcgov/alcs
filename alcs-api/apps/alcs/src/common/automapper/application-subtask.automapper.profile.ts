import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CardSubtaskType } from '../../card/card-subtask/card-subtask-type/card-subtask-type.entity';
import {
  HomepageSubtaskDTO,
  CardSubtaskDto,
  CardSubtaskTypeDto,
} from '../../card/card-subtask/card-subtask.dto';
import { CardSubtask } from '../../card/card-subtask/card-subtask.entity';

@Injectable()
export class ApplicationSubtaskProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CardSubtask,
        CardSubtaskDto,
        forMember(
          (a) => a.completedAt,
          mapFrom((ad) =>
            ad.completedAt ? ad.completedAt.getTime() : undefined,
          ),
        ),
        forMember(
          (a) => a.createdAt,
          mapFrom((ad) => ad.createdAt.getTime()),
        ),
        forMember(
          (ad) => ad.type,
          mapFrom((a) =>
            this.mapper.map(a.type, CardSubtaskType, CardSubtaskTypeDto),
          ),
        ),
      );

      createMap(mapper, CardSubtaskType, CardSubtaskTypeDto);

      createMap(
        mapper,
        CardSubtask,
        HomepageSubtaskDTO,
        forMember(
          (a) => a.completedAt,
          mapFrom((ad) =>
            ad.completedAt ? ad.completedAt.getTime() : undefined,
          ),
        ),
        forMember(
          (a) => a.createdAt,
          mapFrom((ad) => ad.createdAt.getTime()),
        ),
      );
    };
  }
}
