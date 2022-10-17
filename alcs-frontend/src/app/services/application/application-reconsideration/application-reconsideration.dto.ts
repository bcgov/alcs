import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from '../application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application-local-government/application-local-government.dto';
import { ApplicationDecisionMeetingDto } from '../application.dto';

export interface ReconsiderationTypeDto extends BaseCodeDto {
  backgroundColor: string;
  textColor: string;
}
export interface ApplicationDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  applicant: string;
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
  application: ApplicationDto;
  card: CardDto;
  type: ReconsiderationTypeDto;
  submittedDate: number;
  board: BoardSmallDto;
  reviewDate?: number;
  isReviewApproved?: boolean | null;
}

export interface ApplicationReconsiderationDto {
  uuid: string;
  application: ApplicationDto;
  card: CardDto;
  type: ReconsiderationTypeDto;
  submittedDate: number;
  board: BoardSmallDto;
  isReviewApproved?: boolean | null;
}

export interface ApplicationReconsiderationDetailedDto extends ApplicationReconsiderationDto {}

export interface CreateApplicationReconsiderationDto {
  applicationTypeCode: string;
  applicationFileNumber: string;
  applicant: string;
  region: string;
  localGovernmentUuid: string;
  submittedDate: Date;
  reconTypeCode: string;
  boardCode: string;
}

export interface UpdateApplicationReconsiderationDto {
  submittedDate?: number;
  typeCode?: string | undefined;
  reviewDate?: number | null;
  isReviewApproved?: boolean | null;
}
