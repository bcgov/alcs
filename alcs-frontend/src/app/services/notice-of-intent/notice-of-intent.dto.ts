import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationRegionDto } from '../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application/application-local-government/application-local-government.dto';
import { CardDto } from '../card/card.dto';

export interface NoticeOfIntentSubtypeDto extends BaseCodeDto {
  isActive: boolean;
}

export interface CreateNoticeOfIntentDto {
  fileNumber: string;
  localGovernmentUuid: string;
  regionCode: string;
  applicant: string;
  boardCode: string;
  dateSubmittedToAlc: number;
}

export interface NoticeOfIntentDto {
  uuid: string;
  fileNumber: string;
  card: CardDto;
  localGovernment: ApplicationLocalGovernmentDto;
  region: ApplicationRegionDto;
  applicant: string;

  dateSubmittedToAlc?: number;
  feePaidDate?: number;
  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  summary?: string;
  subtype: NoticeOfIntentSubtypeDto[];
  retroactive: boolean | null;
  decisionDate?: number;

  activeDays: number;
  pausedDays: number;
  paused: boolean;
}

export interface UpdateNoticeOfIntentDto {
  dateSubmittedToAlc?: number;
  feePaidDate?: number;
  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  summary?: string;
  retroactive?: boolean;
  subtype?: string[];
}
