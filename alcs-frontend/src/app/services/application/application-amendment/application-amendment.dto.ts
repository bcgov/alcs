import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from '../application-code.dto';
import { ApplicationDecisionDto } from '../application-decision/application-decision.dto';
import { ApplicationLocalGovernmentDto } from '../application-local-government/application-local-government.dto';
import { ApplicationDecisionMeetingDto } from '../application.dto';

export interface ApplicationAmendmentCreateDto {
  applicationFileNumber: string;
  applicationTypeCode: string;
  applicant: string;
  regionCode: string;
  localGovernmentUuid: string;
  submittedDate: number;
  boardCode: string;
  isTimeExtension: boolean;
  amendedDecisionUuids: string[];
}

export interface ApplicationAmendmentUpdateDto {
  submittedDate?: number;
  reviewDate?: number | null;
  isReviewApproved?: boolean | null;
  isTimeExtension?: boolean | null;
  amendedDecisionUuids?: string[];
}

export interface ApplicationForAmendmentDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  statusCode: string;
  applicant: string;
  region: ApplicationRegionDto;
  localGovernment: ApplicationLocalGovernmentDto;
  decisionMeetings: ApplicationDecisionMeetingDto[];
}

export interface ApplicationAmendmentDto {
  uuid: string;
  application: ApplicationForAmendmentDto;
  card: CardDto;
  submittedDate: number;
  reviewDate: number;
  isReviewApproved: boolean | null;
  isTimeExtension: boolean | null;
  amendedDecisions: ApplicationDecisionDto[];
  resultingDecision?: ApplicationDecisionDto;
}
