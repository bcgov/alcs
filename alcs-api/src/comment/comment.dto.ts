import { AutoMap } from '@automapper/classes';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { CommentMentionDto } from './mention/comment-mention.dto';

export class CommentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  body: string;

  @AutoMap()
  author: string;

  @AutoMap()
  edited: boolean;

  @AutoMap()
  createdAt: number;

  isEditable = false;

  @AutoMap()
  @IsArray()
  mentions: CommentMentionDto[];
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  fileNumber: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsArray()
  mentions: CommentMentionDto[];
}

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsArray()
  mentions: CommentMentionDto[];
}
