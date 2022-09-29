import { BaseCodeDto } from '../../shared/dto/base.dto';
import { UserDto } from '../user/user.dto';

export interface ReconsiderationTypeDto extends BaseCodeDto {}

export interface CardTypeDto extends BaseCodeDto {}

export interface ReconsiderationDto {
  highPriority: boolean;
  status: string;
  uuid: string; // this is a cardUuid for now
  board: string;
  assignee?: UserDto;
}

export interface CardCreateDto {
  boardCode: string;
  typeCode: string;
}

export interface CardDto {
  type: string;
}
