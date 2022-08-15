import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

export class CommentMentionDto {
  @AutoMap()
  @IsString()
  userUuid: string;

  @AutoMap()
  @IsString()
  mentionLabel: string;
}
