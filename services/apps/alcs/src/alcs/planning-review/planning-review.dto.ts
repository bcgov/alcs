import { AutoMap } from 'automapper-classes';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { LocalGovernmentDto } from '../local-government/local-government.dto';
import { PlanningReviewMeetingDto } from './planning-review-meeting/planning-review-meeting.dto';

export enum PLANNING_REVIEW_TYPES {
  AAPP = 'AAPP',
  MISC = 'MISC',
  BAPP = 'BAPP',
  ALRB = 'ALRB',
  RGSP = 'RGSP',
  CLUP = 'CLUP',
  OCPP = 'OCPP',
  TPPP = 'TPPP',
  UEPP = 'UEPP',
  ZBPP = 'ZBPP',
  PARK = 'PARK',
}

export class PlanningReviewTypeDto extends BaseCodeDto {
  @AutoMap()
  shortLabel: string;

  @AutoMap()
  backgroundColor: string;

  @AutoMap()
  textColor: string;
}

export class CreatePlanningReviewDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  documentName: string;

  @IsNumber()
  @IsNotEmpty()
  submissionDate: number;

  @IsNumber()
  @IsOptional()
  dueDate?: number;

  @IsString()
  @IsNotEmpty()
  localGovernmentUuid: string;

  @IsString()
  @IsNotEmpty()
  typeCode: string;

  @IsString()
  @IsNotEmpty()
  regionCode: string;
}

export class PlanningReviewDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileNumber: string;

  @AutoMap(() => String)
  legacyId: string | null;

  @AutoMap()
  open: boolean;

  @AutoMap()
  documentName: string;

  @AutoMap()
  localGovernmentUuid: string;

  @AutoMap()
  typeCode: string;

  @AutoMap()
  regionCode: string;

  @AutoMap(() => LocalGovernmentDto)
  localGovernment: LocalGovernmentDto;

  @AutoMap(() => ApplicationRegionDto)
  region: ApplicationRegionDto;

  @AutoMap(() => [PlanningReviewMeetingDto])
  meetings: PlanningReviewMeetingDto[];

  @AutoMap(() => PlanningReviewTypeDto)
  type: PlanningReviewTypeDto;
}

export class CreatePlanningReferralDto {
  @IsUUID()
  @IsNotEmpty()
  planningReviewUuid: string;

  @IsString()
  @IsNotEmpty()
  referralDescription: string;

  @IsNumber()
  @IsNotEmpty()
  submissionDate: number;

  @IsNumber()
  @IsOptional()
  dueDate?: number;
}

export class UpdatePlanningReferralDto {
  @IsString()
  @IsOptional()
  referralDescription?: string;

  @IsNumber()
  @IsOptional()
  submissionDate?: number;

  @IsNumber()
  @IsOptional()
  dueDate?: number;

  @IsNumber()
  @IsOptional()
  responseDate?: number;

  @IsString()
  @IsOptional()
  responseDescription?: string;
}

export class PlanningReferralDto {
  @AutoMap()
  uuid: string;

  dueDate: number;
  submissionDate: number;
  responseDate?: number;

  @AutoMap(() => String)
  referralDescription?: string;

  @AutoMap(() => PlanningReviewDto)
  planningReview: PlanningReviewDto;

  @AutoMap(() => String)
  responseDescription?: string;

  @AutoMap(() => CardDto)
  card: CardDto;
}

export class PlanningReviewDetailedDto extends PlanningReviewDto {
  @AutoMap(() => [PlanningReferralDto])
  referrals: PlanningReferralDto[];
}

export class UpdatePlanningReviewDto {
  @IsBoolean()
  @IsOptional()
  open?: boolean;

  @IsString()
  @IsOptional()
  typeCode?: string;

  @IsNumber()
  @IsOptional()
  decisionDate?: number | null;

  @IsString()
  @IsOptional()
  regionCode?: string;

  @IsString()
  @IsOptional()
  localGovernmentUuid?: string;
}
