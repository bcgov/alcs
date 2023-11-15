import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { CommentDto } from '../../alcs/comment/comment.dto';
import { Comment } from '../../alcs/comment/comment.entity';
import { CommentMentionDto } from '../../alcs/comment/mention/comment-mention.dto';
import { CommentMention } from '../../alcs/comment/mention/comment-mention.entity';

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
        forMember(
          (cd) => cd.mentions,
          mapFrom((c) => c.mentions),
        ),
      );
      createMap(mapper, CommentMention, CommentMentionDto);
      createMap(mapper, CommentMentionDto, CommentMention);
    };
  }
}
