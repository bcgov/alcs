import { AutoMap } from '@automapper/classes';
import { IsOptional, IsUUID } from 'class-validator';
import { ApplicationReconsiderationDto } from '../../application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../application/application.dto';
import { AssigneeDto } from '../../user/user.dto';

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
  type: string;

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

export class ApplicationSubtaskWithApplicationDTO extends CardSubtaskDto {
  @AutoMap()
  application: ApplicationDto;

  @AutoMap()
  reconsideration?: ApplicationReconsiderationDto;
}
