import { UserDto } from '../user/user.dto';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationTypeDto } from './application-type.dto';

export interface CreateApplicationDto {
  fileNumber: string;
  applicant: string;
  type: string;
}

export interface ApplicationDto {
  fileNumber: string;
  title: string;
  applicant: string;
  status: string;
  type: string;
  assignee?: UserDto;
  activeDays: number;
  pausedDays: number;
  paused: boolean;
}

export interface ApplicationPartialDto {
  fileNumber: string;
  title?: string;
  applicant?: string;
  status?: string;
  type?: string;
  assigneeUuid?: string | null;
  assignee?: UserDto;
  paused?: boolean;
}

export interface ApplicationDetailedDto extends ApplicationDto {
  statusDetails: ApplicationStatusDto;
  typeDetails: ApplicationTypeDto;
}
