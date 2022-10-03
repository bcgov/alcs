import { BoardDto } from '../board/board.dto';
import { CardDto } from '../card/card.dto';
import { UserDto } from '../user/user.dto';
import { ApplicationRegionDto, ApplicationTypeDto, CardStatusDto } from './application-code.dto';

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
  // cardUuid: string;
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
  card: CardDto;
}

export interface ApplicationPartialDto {
  cardUuid?: string;
  fileNumber?: string;
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
  statusDetails: CardStatusDto;
  typeDetails: ApplicationTypeDto;
  regionDetails: ApplicationRegionDto;
  boardDetails?: BoardDto;
}
