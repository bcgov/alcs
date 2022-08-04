import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  body: string;

  @AutoMap()
  madeBy: string;

  @AutoMap()
  edited: boolean;

  @AutoMap()
  createdAt: number;

  isEditable = false;
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  fileNumber: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
