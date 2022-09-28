import { BaseCodeDto } from '../../shared/dto/base.dto';
import { UserDto } from '../user/user.dto';

export interface ReconsiderationTypeDto extends BaseCodeDto {}

export interface ReconsiderationDto {
  highPriority: boolean;
  status: string;
  cardUuid: string;
  board: string;
  assignee?: UserDto;
}

export interface CardCreateDto {
  boardCode: string;
  typeCode: string;
}
