import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApplicationOwnerDto } from '../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationSubmissionDetailedDto } from '../../portal/application-submission/application-submission.dto';
import { ApplicationDecisionMeetingDto } from '../application-decision/application-decision-v1/application-decision-meeting/application-decision-meeting.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { LocalGovernmentDto } from '../local-government/local-government.dto';

export class AlcsApplicationSubmissionDto extends ApplicationSubmissionDetailedDto {
  primaryContact?: ApplicationOwnerDto;
}

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @IsNotEmpty()
  @IsString()
  applicant: string;

  @IsNotEmpty()
  @IsString()
  typeCode: string;

  @IsNotEmpty()
  @IsNumber()
  dateSubmittedToAlc: number;

  @IsString()
  @IsOptional()
  regionCode?: string;

  @IsNotEmpty()
  @IsString()
  localGovernmentUuid: string;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsNumber()
  dateSubmittedToAlc?: number;

  @IsOptional()
  @IsString()
  applicant?: string;

  @IsOptional()
  @IsBoolean()
  hideFromPortal?: boolean;

  @IsOptional()
  @IsString()
  typeCode?: string;

  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsString()
  statusCode?: string;

  @IsOptional()
  @IsUUID()
  assigneeUuid?: string;

  @IsBoolean()
  @IsOptional()
  paused?: boolean;

  @IsOptional()
  @IsNumber()
  feePaidDate?: number;

  @IsBoolean()
  @IsOptional()
  feeWaived?: boolean;

  @IsBoolean()
  @IsOptional()
  feeSplitWithLg?: boolean;

  @IsOptional()
  @IsString()
  feeAmount?: string;

  @IsOptional()
  @IsNumber()
  dateAcknowledgedIncomplete?: number;

  @IsOptional()
  @IsNumber()
  dateReceivedAllItems?: number;

  @IsOptional()
  @IsNumber()
  dateAcknowledgedComplete?: number;

  @IsBoolean()
  @IsOptional()
  highPriority?: boolean;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsOptional()
  @IsNumber()
  notificationSentDate?: number;

  @IsOptional()
  @IsNumber()
  alrArea?: number;

  @IsOptional()
  @IsString()
  agCap?: string;

  @IsOptional()
  @IsString()
  agCapSource?: string;

  @IsOptional()
  @IsString()
  agCapMap?: string;

  @IsOptional()
  @IsString()
  agCapConsultant?: string;

  @IsOptional()
  @IsString()
  nfuUseType?: string;

  @IsOptional()
  @IsString()
  staffObservations?: string;

  @IsOptional()
  @IsString()
  nfuUseSubType?: string;

  @IsOptional()
  @IsString()
  inclExclApplicantType?: string;

  @IsOptional()
  @IsNumber()
  proposalEndDate?: number;

  @IsOptional()
  @IsNumber()
  proposalEndDate2?: number;

  @IsOptional()
  @IsNumber()
  proposalExpiryDate?: number;
}

export class ApplicationDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileNumber: string;

  @AutoMap()
  applicant: string;

  @AutoMap()
  hideFromPortal: boolean;

  activeDays: number;

  pausedDays: number;

  paused: boolean;

  dateSubmittedToAlc?: number;

  feePaidDate?: number;

  @AutoMap(() => Boolean)
  feeWaived?: boolean;

  @AutoMap(() => Boolean)
  feeSplitWithLg?: boolean;

  @AutoMap(() => String)
  feeAmount?: string;

  dateAcknowledgedIncomplete?: number;

  dateReceivedAllItems?: number;

  dateAcknowledgedComplete?: number;

  decisionDate?: number;

  notificationSentDate?: number;

  @AutoMap(() => ApplicationTypeDto)
  type: ApplicationTypeDto;

  @AutoMap(() => String)
  summary: string | null;

  @AutoMap(() => ApplicationRegionDto)
  region: ApplicationRegionDto;

  @AutoMap(() => LocalGovernmentDto)
  localGovernment: LocalGovernmentDto;

  @AutoMap(() => ApplicationDecisionMeetingDto)
  decisionMeetings: ApplicationDecisionMeetingDto[];

  @AutoMap()
  @Type(() => CardDto)
  card?: CardDto;

  @AutoMap()
  @Type(() => AlcsApplicationSubmissionDto)
  submittedApplication?: AlcsApplicationSubmissionDto;

  @AutoMap()
  source: 'ALCS' | 'APPLICANT';

  @AutoMap(() => Number)
  alrArea?: number;

  @AutoMap(() => String)
  agCap?: string;

  @AutoMap(() => String)
  agCapSource?: string;

  @AutoMap(() => String)
  agCapMap?: string;

  @AutoMap(() => String)
  staffObservations?: string;

  @AutoMap(() => String)
  agCapConsultant?: string;

  @AutoMap(() => String)
  nfuUseType?: string;

  @AutoMap(() => String)
  nfuUseSubType?: string;

  @AutoMap(() => String)
  inclExclApplicantType?: string;

  @AutoMap(() => String)
  legacyId?: string;

  proposalEndDate?: number;
  proposalEndDate2?: number;
  proposalExpiryDate?: number;
}

export class ApplicationUpdateServiceDto {
  dateSubmittedToAlc?: Date | null | undefined;
  applicant?: string;
  hideFromPortal?: boolean;
  typeCode?: string;
  regionCode?: string;
  feePaidDate?: Date | null;
  feeWaived?: boolean | undefined | null;
  feeSplitWithLg?: boolean | undefined | null;
  feeAmount?: number | undefined | null;
  dateAcknowledgedIncomplete?: Date | null | undefined;
  dateReceivedAllItems?: Date | null | undefined;
  dateAcknowledgedComplete?: Date | null | undefined;
  decisionDate?: Date | null | undefined;
  summary?: string;
  notificationSentDate?: Date | null;
  alrArea?: number;
  agCap?: string;
  agCapSource?: string;
  agCapMap?: string;
  agCapConsultant?: string;
  nfuUseType?: string;
  nfuUseSubType?: string;
  inclExclApplicantType?: string;
  proposalEndDate?: Date | null;
  proposalEndDate2?: Date | null;
  proposalExpiryDate?: Date | null;
  staffObservations?: string | null;
  localGovernmentUuid?: string;
}

export class CreateApplicationServiceDto {
  fileNumber: string;
  applicant: string;
  typeCode: string;
  dateSubmittedToAlc?: Date | null | undefined;
  regionCode?: string;
  localGovernmentUuid?: string;
  source?: 'ALCS' | 'APPLICANT';
}
