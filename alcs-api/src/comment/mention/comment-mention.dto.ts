import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

export class CommentMentionDto {
  // @IsOptional()
  // commentUuid: string;

  @AutoMap()
  @IsString()
  userUuid: string;

  // TODO: rename all mentionName to mentionLabel
  @AutoMap()
  @IsString()
  mentionName: string;
}
