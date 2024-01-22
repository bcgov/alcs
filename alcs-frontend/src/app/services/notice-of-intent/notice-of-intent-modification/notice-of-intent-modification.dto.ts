import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { ApplicationRegionDto } from '../../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../application/application-local-government/application-local-government.dto';
import { CardDto } from '../../card/card.dto';
import { NoticeOfIntentDecisionDto } from '../decision/notice-of-intent-decision.dto';

export interface NoticeOfIntentModificationCreateDto {
  fileNumber: string;
  applicant: string;
  description: string;
  regionCode: string;
  localGovernmentUuid: string;
  submittedDate: number;
  boardCode: string;
  modifiesDecisionUuids: string[];
}

export interface NoticeOfIntentModificationUpdateDto {
  description?: string;
  submittedDate?: number;
  reviewOutcomeCode?: string;
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
  description: string;
  submittedDate: number;
  reviewOutcome: ModificationReviewOutcomeTypeDto;
  modifiesDecisions: NoticeOfIntentDecisionDto[];
  resultingDecision?: NoticeOfIntentDecisionDto;
}

export interface ModificationReviewOutcomeTypeDto extends BaseCodeDto {}
