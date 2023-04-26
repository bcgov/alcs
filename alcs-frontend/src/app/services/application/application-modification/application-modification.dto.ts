import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from '../application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application-local-government/application-local-government.dto';
import { ApplicationDecisionMeetingDto } from '../application.dto';
import { ApplicationDecisionDto } from '../decision/application-decision-v1/application-decision.dto';

export interface ApplicationModificationCreateDto {
  applicationFileNumber: string;
  applicationTypeCode: string;
  applicant: string;
  regionCode: string;
  localGovernmentUuid: string;
  submittedDate: number;
  boardCode: string;
  isTimeExtension: boolean;
  modifiesDecisionUuids: string[];
}

export interface ApplicationModificationUpdateDto {
  submittedDate?: number;
  reviewDate?: number | null;
  reviewOutcomeCode?: string;
  isTimeExtension?: boolean | null;
  modifiesDecisionUuids?: string[];
}

export interface ApplicationForModificationDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  statusCode: string;
  applicant: string;
  region: ApplicationRegionDto;
  localGovernment: ApplicationLocalGovernmentDto;
  decisionMeetings: ApplicationDecisionMeetingDto[];
}

export interface ApplicationModificationDto {
  uuid: string;
  application: ApplicationForModificationDto;
  card: CardDto;
  submittedDate: number;
  reviewDate: number;
  reviewOutcome: ModificationReviewOutcomeTypeDto;
  isTimeExtension: boolean | null;
  modifiesDecisions: ApplicationDecisionDto[];
  resultingDecision?: ApplicationDecisionDto;
}

export interface ModificationReviewOutcomeTypeDto extends BaseCodeDto {}
