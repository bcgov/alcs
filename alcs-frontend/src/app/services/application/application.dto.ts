import { BoardDto } from '../board/board.dto';
import { CardDto } from '../card/card.dto';
import { UserDto } from '../user/user.dto';
import { ApplicationRegionDto, ApplicationTypeDto, CardStatusDto } from './application-code.dto';
import { ApplicationLocalGovernmentDto } from './application-local-government/application-local-government.dto';

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
  summary?: string;
  type: string;
  board: string;
  dateReceived: number;
  datePaid?: number;
  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  decisionDate?: number;
  region: string;
  localGovernment: ApplicationLocalGovernmentDto;
  activeDays: number;
  pausedDays: number;
  paused: boolean;
  decisionMeetings: ApplicationDecisionMeetingDto[];
  card: CardDto;
}

export interface UpdateApplicationDto {
  applicant?: string;
  status?: string;
  region?: string;
  summary?: string;
  datePaid?: number;
  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  type?: string;
  assigneeUuid?: string | null;
  assignee?: UserDto;
  highPriority?: boolean;
}

export interface ApplicationDetailedDto extends ApplicationDto {
  statusDetails: CardStatusDto;
  typeDetails: ApplicationTypeDto;
  regionDetails: ApplicationRegionDto;
  boardDetails?: BoardDto;
}
