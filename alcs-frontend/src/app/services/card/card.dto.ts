import { CardType } from '../../shared/card/card.component';
import { CardStatusDto } from '../application/application-code.dto';
import { BoardDto } from '../board/board.dto';
import { AssigneeDto } from '../user/user.dto';

export interface CardUpdateDto {
  uuid: string;
  assigneeUuid?: string | null;
  boardCode?: string;
  typeCode?: CardType;
  statusCode?: string;
  highPriority?: boolean;
}

export interface CardFlatDto {
  uuid: string;
  assigneeUuid: string;
  typeCode: CardType;
  highPriority: boolean;
  statusCode: string;
  boardUuid: string;
}

export interface CardDto {
  uuid: string;
  type: CardType;
  highPriority: boolean;
  status: CardStatusDto;
  assignee?: AssigneeDto;
  boardCode: string;
  createdAt: number;
}
