import { UserDto } from '../../services/user/user.dto';
import { ApplicationStatusDto } from './application-status.dto';

export interface ApplicationDto {
  fileNumber: string;
  title: string;
  body: string;
  status: string;
  assignee?: UserDto;
  activeDays: number;
  pausedDays: number;
}

export interface ApplicationPartialDto {
  fileNumber: string;
  title?: string;
  body?: string;
  status?: string;
  assigneeUuid?: string | null;
  assignee?: UserDto;
}

export interface ApplicationDetailedDto extends ApplicationDto {
  statusDetails: ApplicationStatusDto;
}
