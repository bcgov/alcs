import { UserDto } from '../user/user.dto';
import { ApplicationDecisionMakerDto, ApplicationStatusDto, ApplicationTypeDto } from './application-code.dto';

export interface CreateApplicationDto {
  fileNumber: string;
  applicant: string;
  type: string;
  decisionMaker?: string;
}

export interface ApplicationDto {
  fileNumber: string;
  applicant: string;
  status: string;
  type: string;
  decisionMaker?: string;
  assignee?: UserDto;
  activeDays: number;
  pausedDays: number;
  paused: boolean;
}

export interface ApplicationPartialDto {
  fileNumber: string;
  applicant?: string;
  status?: string;
  decisionMaker?: string;
  type?: string;
  assigneeUuid?: string | null;
  assignee?: UserDto;
  paused?: boolean;
}

export interface ApplicationDetailedDto extends ApplicationDto {
  statusDetails: ApplicationStatusDto;
  typeDetails: ApplicationTypeDto;
  decisionMakerDetails?: ApplicationDecisionMakerDto;
}
