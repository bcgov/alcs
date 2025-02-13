import { AutoMap } from 'automapper-classes';
import { IsOptional, IsUUID } from 'class-validator';
import { AssigneeDto } from '../../../user/user.dto';
import { PlanningReviewTypeDto } from '../../planning-review/planning-review.dto';
import { CardDto } from '../card.dto';

export enum PARENT_TYPE {
  APPLICATION = 'application',
  RECONSIDERATION = 'reconsideration',
  MODIFICATION = 'modification',
  PLANNING_REVIEW = 'planning-review',
  NOTICE_OF_INTENT = 'notice-of-intent',
  NOTIFICATION = 'notification',
  INQUIRY = 'inquiry',
}

export class UpdateCardSubtaskDto {
  @AutoMap()
  @IsUUID()
  @IsOptional()
  assignee?: string;

  @AutoMap()
  @IsOptional()
  completedAt?: number | null;
}

export class CardSubtaskTypeDto {
  @AutoMap()
  code: string;

  @AutoMap()
  label: string;

  @AutoMap()
  backgroundColor: string;

  @AutoMap()
  textColor: string;
}

export class CardSubtaskDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  type: CardSubtaskTypeDto;

  @AutoMap()
  assignee?: AssigneeDto;

  @AutoMap()
  createdAt: number;

  @AutoMap()
  completedAt?: number;
}

export class HomepageSubtaskDTO extends CardSubtaskDto {
  card: CardDto;
  title: string;
  appType?: PlanningReviewTypeDto;
  parentType: PARENT_TYPE;
  activeDays?: number;
  paused: boolean;
  subtaskDays?: number;
  isCondition: boolean;
  isConditionRecon: boolean;
  isConditionModi: boolean;
}

export enum CARD_SUBTASK_TYPE {
  GIS = 'GIS',
  AUDIT = 'AUDT',
  AGROLOGIST = 'AGRO',
  PEER_REVIEW = 'PEER',
}
