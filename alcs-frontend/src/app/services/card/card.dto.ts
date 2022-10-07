import { BaseCodeDto } from '../../shared/dto/base.dto';
import { BoardDto } from '../board/board.dto';
import { UserDto } from '../user/user.dto';

export interface CardTypeDto extends BaseCodeDto {}

export interface CardCreateDto {
  boardCode: string;
  typeCode: string;
}

export interface CardUpdateDto {
  uuid: string;
  assigneeUuid?: string;
  boardCode?: string;
  typeCode?: string;
  statusCode?: string;
  highPriority?: boolean;
}

export interface CardDto {
  uuid: string;
  type: string;
  highPriority: boolean;
  status: string;
  assignee?: UserDto;
  board: BoardDto;
}
