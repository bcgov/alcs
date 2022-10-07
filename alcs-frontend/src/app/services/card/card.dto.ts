import { BaseCodeDto } from '../../shared/dto/base.dto';
import { CardStatusDto } from '../application/application-code.dto';
import { BoardDto } from '../board/board.dto';
import { UserDto } from '../user/user.dto';

export interface CardTypeDto extends BaseCodeDto {}

export interface CardCreateDto {
  boardCode: string;
  typeCode: string;
}

export interface CardUpdateDto {
  uuid: string;
  assigneeUuid?: string | null;
  boardCode?: string;
  typeCode?: string;
  statusCode?: string;
  highPriority?: boolean;
}

export interface CardFlatDto {
  uuid: string;
  assigneeUuid: string;
  type: string;
  highPriority: boolean;
  statusUuid: string;
  boardUuid: string;
}

export interface CardDto {
  uuid: string;
  type: string;
  highPriority: boolean;
  status: CardStatusDto;
  assignee?: UserDto;
  board: BoardDto;
}
