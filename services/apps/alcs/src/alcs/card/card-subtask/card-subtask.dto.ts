import { AutoMap } from '@automapper/classes';
import { IsOptional, IsUUID } from 'class-validator';
import { ApplicationTypeDto } from '../../code/application-code/application-type/application-type.dto';
import { AssigneeDto } from '../../../user/user.dto';
import { CardDto } from '../card.dto';

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
  appType?: ApplicationTypeDto;
  parentType:
    | 'application'
    | 'reconsideration'
    | 'covenant'
    | 'modification'
    | 'planning-review';
  activeDays?: number;
  paused: boolean;
}

export enum CARD_SUBTASK_TYPE {
  GIS = 'GIS',
  AUDIT = 'AUDT',
  AGROLOGIST = 'AGRO',
}
