import { AssigneeDto } from '../../user/user.dto';
import { CardDto } from '../card.dto';

export interface UpdateApplicationSubtaskDto {
  assignee?: string | null;
  completedAt?: number | null;
}

export interface CardSubtaskDto {
  uuid: string;
  type: CardSubtaskTypeDto;
  assignee?: AssigneeDto;
  createdAt: number;
  completedAt?: number;
}

export interface CardSubtaskTypeDto {
  code: string;
  label: string;
  backgroundColor: string;
  textColor: string;
}

export interface HomepageSubtaskDto extends CardSubtaskDto {
  card: CardDto;
  title: string;
  activeDays?: number;
  paused: boolean;
}

export enum CARD_SUBTASK_TYPE {
  GIS = 'GIS',
  AUDIT = 'AUDIT',
}
