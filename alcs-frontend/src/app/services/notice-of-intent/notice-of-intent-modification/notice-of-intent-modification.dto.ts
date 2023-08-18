import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { ApplicationRegionDto } from '../../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../application/application-local-government/application-local-government.dto';
import { CardDto } from '../../card/card.dto';
import { NoticeOfIntentDecisionDto } from '../decision/notice-of-intent-decision.dto';

export interface NoticeOfIntentModificationCreateDto {
  fileNumber: string;
  applicant: string;
  regionCode: string;
  localGovernmentUuid: string;
  submittedDate: number;
  boardCode: string;
  modifiesDecisionUuids: string[];
}

export interface NoticeOfIntentModificationUpdateDto {
  submittedDate?: number;
  reviewDate?: number | null;
  reviewOutcomeCode?: string;
  outcomeNotificationDate?: number | null;
  modifiesDecisionUuids?: string[];
}

export interface NoticeOfIntentForModificationDto {
  fileNumber: string;
  statusCode: string;
  applicant: string;
  retroactive: boolean;
  region: ApplicationRegionDto;
  localGovernment: ApplicationLocalGovernmentDto;
}

export interface NoticeOfIntentModificationDto {
  uuid: string;
  noticeOfIntent: NoticeOfIntentForModificationDto;
  card: CardDto;
  submittedDate: number;
  reviewDate: number;
  outcomeNotificationDate: number | null;
  reviewOutcome: ModificationReviewOutcomeTypeDto;
  modifiesDecisions: NoticeOfIntentDecisionDto[];
  resultingDecision?: NoticeOfIntentDecisionDto;
}

export interface ModificationReviewOutcomeTypeDto extends BaseCodeDto {}
