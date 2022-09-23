import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  ApplicationSubtaskDto,
  ApplicationSubtaskWithApplicationDTO,
} from '../../application/application-subtask/application-subtask.dto';
import { CardSubtask } from '../../application/application-subtask/application-subtask.entity';

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
        ApplicationSubtaskDto,
        forMember(
          (a) => a.backgroundColor,
          mapFrom((ad) => ad.type.backgroundColor),
        ),
        forMember(
          (a) => a.textColor,
          mapFrom((ad) => ad.type.textColor),
        ),
        forMember(
          (a) => a.assignee,
          mapFrom((ad) => (ad.assignee ? ad.assignee.uuid : undefined)),
        ),
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
          (a) => a.type,
          mapFrom((ad) => ad.type.type),
        ),
      );

      createMap(
        mapper,
        CardSubtask,
        ApplicationSubtaskWithApplicationDTO,
        forMember(
          (a) => a.backgroundColor,
          mapFrom((ad) => ad.type.backgroundColor),
        ),
        forMember(
          (a) => a.textColor,
          mapFrom((ad) => ad.type.textColor),
        ),
        forMember(
          (a) => a.assignee,
          mapFrom((ad) => (ad.assignee ? ad.assignee.uuid : undefined)),
        ),
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
          (a) => a.type,
          mapFrom((ad) => ad.type.type),
        ),
      );
    };
  }
}
