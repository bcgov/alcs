import { ApplicationDto } from '../application.dto';

export interface UpdateApplicationSubtaskDto {
  assignee?: string | null;
  completedAt?: number | null;
}

export interface ApplicationSubtaskDto {
  uuid: string;
  type: string;
  backgroundColor: string;
  textColor: string;
  assignee?: string;
  createdAt: number;
  completedAt?: number;
}

export interface ApplicationSubtaskWithApplicationDto extends ApplicationSubtaskDto {
  application: ApplicationDto;
}
