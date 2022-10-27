import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from '../application-code.dto';
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
}

export interface ApplicationAmendmentUpdateDto {
  submittedDate?: number;
  reviewDate?: number | null;
  isReviewApproved?: boolean | null;
  isTimeExtension?: boolean | null;
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
}
