import { BoardDto } from '../board/board.dto';
import { UserDto } from '../user/user.dto';
import { ApplicationRegionDto, ApplicationStatusDto, ApplicationTypeDto } from './application-code.dto';

export interface CreateApplicationDto {
  fileNumber: string;
  applicant: string;
  type: string;
  dateReceived: number;
  region?: string;
  localGovernmentUuid?: string;
}

export interface ApplicationDecisionMeetingDto {
  date: Date;
}

export interface ApplicationDto {
  fileNumber: string;
  applicant: string;
  status: string;
  type: string;
  board: string;
  dateReceived: number;
  datePaid?: number;
  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  decisionDate?: number;
  region: string;
  localGovernment: string;
  assignee?: UserDto;
  activeDays: number;
  pausedDays: number;
  paused: boolean;
  highPriority: boolean;
  decisionMeetings: ApplicationDecisionMeetingDto[];
}

export interface ApplicationPartialDto {
  fileNumber: string;
  applicant?: string;
  status?: string;
  region?: string;
  dateReceived?: number;
  datePaid?: number;
  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  decisionDate?: number;
  type?: string;
  assigneeUuid?: string | null;
  assignee?: UserDto;
  paused?: boolean;
  highPriority?: boolean;
}

export interface ApplicationDetailedDto extends ApplicationDto {
  statusDetails: ApplicationStatusDto;
  typeDetails: ApplicationTypeDto;
  regionDetails: ApplicationRegionDto;
  boardDetails?: BoardDto;
}
