import { ApplicationReconsiderationDto } from '../../application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../application/application.dto';
import { AssigneeDto } from '../../user/user.dto';

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
  type: string;
  backgroundColor: string;
  textColor: string;
}

export interface ApplicationSubtaskWithApplicationDto extends CardSubtaskDto {
  application: ApplicationDto;
  reconsideration: ApplicationReconsiderationDto;
}
