import { BoardDto } from '../board/board.dto';
import { UserDto } from '../user/user.dto';
import { ApplicationRegionDto, ApplicationStatusDto, ApplicationTypeDto } from './application-code.dto';

export interface CreateApplicationDto {
  fileNumber: string;
  applicant: string;
  type: string;
  region?: string;
}

export interface ApplicationDto {
  fileNumber: string;
  applicant: string;
  status: string;
  type: string;
  board: string;
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
  regionDetails?: ApplicationRegionDto;
  boardDetails?: BoardDto;
}
