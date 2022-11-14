import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from '../application-code.dto';
import { ApplicationDecisionDto } from '../application-decision/application-decision.dto';
import { ApplicationLocalGovernmentDto } from '../application-local-government/application-local-government.dto';
import { ApplicationDecisionMeetingDto } from '../application.dto';

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
  isReviewApproved?: boolean | null;
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
  isReviewApproved: boolean | null;
  isTimeExtension: boolean | null;
  modifiesDecisions: ApplicationDecisionDto[];
  resultingDecision?: ApplicationDecisionDto;
}
