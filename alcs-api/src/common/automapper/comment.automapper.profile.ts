import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CommentDto } from '../../comment/comment.dto';
import { Comment } from '../../comment/comment.entity';

@Injectable()
export class CommentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, CommentDto, Comment);
      createMap(
        mapper,
        Comment,
        CommentDto,
        forMember(
          (ud) => ud.author,
          mapFrom((u) => u.author.name),
        ),
      );
    };
  }
}
