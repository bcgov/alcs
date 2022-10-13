import { AutoMap } from '@automapper/classes';
import { IsOptional, IsUUID } from 'class-validator';
import { ApplicationReconsiderationDto } from '../../application-reconsideration/applicationReconsideration.dto';
import { ApplicationDto } from '../../application/application.dto';

export class UpdateCardSubtaskDto {
  @AutoMap()
  @IsUUID()
  @IsOptional()
  assignee?: string;

  @AutoMap()
  @IsOptional()
  completedAt?: number | null;
}

export class CardSubtaskDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  type: string;

  @AutoMap()
  backgroundColor: string;

  @AutoMap()
  textColor: string;

  @AutoMap()
  assignee?: string;

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
