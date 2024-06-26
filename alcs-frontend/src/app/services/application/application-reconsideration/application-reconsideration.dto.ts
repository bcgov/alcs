import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from '../application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application-local-government/application-local-government.dto';
import { ApplicationDecisionMeetingDto } from '../application.dto';
import { ApplicationDecisionDto } from '../decision/application-decision-v2/application-decision.dto';

export const enum RECONSIDERATION_TYPE {
  T_33 = '33',
  T_33_1 = '33.1',
}

export interface ReconsiderationTypeDto extends BaseCodeDto {
  backgroundColor: string;
  textColor: string;
}

export interface ReconsiderationReviewOutcomeTypeDto extends BaseCodeDto {}

export interface ApplicationForReconsiderationDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  applicant: string;
  source: string;
  region: ApplicationRegionDto;
  localGovernment: ApplicationLocalGovernmentDto;
  decisionMeetings: ApplicationDecisionMeetingDto[];
}

export interface BoardSmallDto {
  code: string;
  title: string;
  decisionMaker: string;
}

export interface ApplicationReconsiderationDto {
  uuid: string;
  application: ApplicationForReconsiderationDto;
  card: CardDto;
  type: ReconsiderationTypeDto;
  submittedDate: number;
  board: BoardSmallDto;
  reviewDate?: number;
  reviewOutcome?: ReconsiderationReviewOutcomeTypeDto | null;
  decisionOutcome?: ReconsiderationReviewOutcomeTypeDto | null;
  reconsidersDecisions: ApplicationDecisionDto[];
  resultingDecision: ApplicationDecisionDto | null;
  description?: string;
  isNewProposal?: boolean | null;
  isIncorrectFalseInfo?: boolean | null;
  isNewEvidence?: boolean | null;
}

export interface ApplicationReconsiderationDetailedDto extends ApplicationReconsiderationDto {}

export interface CreateApplicationReconsiderationDto {
  applicationTypeCode: string;
  applicationFileNumber: string;
  applicant: string;
  regionCode: string;
  localGovernmentUuid: string;
  submittedDate: Date;
  reconTypeCode: string;
  boardCode: string;
  reconsideredDecisionUuids: string[];
  description?: string;
  isNewProposal?: boolean | null;
  isIncorrectFalseInfo?: boolean | null;
  isNewEvidence?: boolean | null;
}

export interface UpdateApplicationReconsiderationDto {
  submittedDate?: number;
  typeCode?: string | undefined;
  reviewDate?: number | null;
  reviewOutcomeCode?: string | null;
  decisionOutcomeCode?: string | null;
  reconsideredDecisionUuids?: string[];
  description?: string;
  isNewProposal?: boolean | null;
  isIncorrectFalseInfo?: boolean | null;
  isNewEvidence?: boolean | null;
}
