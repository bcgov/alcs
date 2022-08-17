import { UserDto } from '../user/user.dto';
import {
  ApplicationDecisionMakerDto,
  ApplicationRegionDto,
  ApplicationStatusDto,
  ApplicationTypeDto,
} from './application-code.dto';

export interface CreateApplicationDto {
  fileNumber: string;
  applicant: string;
  type: string;
  decisionMaker?: string;
  region?: string;
}

export interface ApplicationDto {
  fileNumber: string;
  applicant: string;
  status: string;
  type: string;
  decisionMaker: string;
  region?: string;
  assignee?: UserDto;
  activeDays: number;
  pausedDays: number;
  paused: boolean;
  highPriority: boolean;
}

export interface ApplicationPartialDto {
  fileNumber: string;
  applicant?: string;
  status?: string;
  decisionMaker?: string;
  region?: string;
  type?: string;
  assigneeUuid?: string | null;
  assignee?: UserDto;
  paused?: boolean;
  highPriority?: boolean;
}

export interface ApplicationDetailedDto extends ApplicationDto {
  statusDetails: ApplicationStatusDto;
  typeDetails: ApplicationTypeDto;
  decisionMakerDetails?: ApplicationDecisionMakerDto;
  regionDetails?: ApplicationRegionDto;
}
