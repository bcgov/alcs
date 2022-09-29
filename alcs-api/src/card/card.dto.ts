import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserDto } from '../user/user.dto';

export class CardUpdateDto {
  @AutoMap()
  assigneeUuid: string;

  @AutoMap()
  statusUuid: string;

  @AutoMap()
  boardUuid: string;

  @AutoMap()
  cardTypeCode: string;
}

export class CardCreateDto {
  @IsNotEmpty()
  @IsString()
  boardCode: string;

  @IsNotEmpty()
  @IsString()
  typeCode: string;
}

export class CardDto {
  @AutoMap()
  assignee?: UserDto;

  @AutoMap()
  status: string;

  @AutoMap()
  type: string;

  @AutoMap()
  uuid: string;
}
