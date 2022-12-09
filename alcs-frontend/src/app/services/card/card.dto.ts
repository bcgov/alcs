import { CardStatusDto } from '../application/application-code.dto';
import { BoardDto } from '../board/board.dto';
import { AssigneeDto } from '../user/user.dto';

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
  typeCode: string;
  highPriority: boolean;
  statusCode: string;
  boardUuid: string;
}

export interface CardDto {
  uuid: string;
  type: string;
  highPriority: boolean;
  status: CardStatusDto;
  assignee?: AssigneeDto;
  board: BoardDto;
  createdAt: number;
}
