import { AutoMap } from '@automapper/classes';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';
import { NoticeOfIntentOwnerDto } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentSubmissionDetailedDto } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { NoticeOfIntentTypeDto } from './notice-of-intent-type/notice-of-intent-type.dto';
import { LocalGovernmentDto } from '../local-government/local-government.dto';

export class AlcsNoticeOfIntentSubmissionDto extends NoticeOfIntentSubmissionDetailedDto {
  primaryContact?: NoticeOfIntentOwnerDto;
}
export class NoticeOfIntentSubtypeDto extends BaseCodeDto {
  @AutoMap()
  @IsBoolean()
  isActive: boolean;
}

export class CreateNoticeOfIntentDto {
  @IsNumber()
  dateSubmittedToAlc: number;

  @IsString()
  @IsNotEmpty()
  fileNumber: string;

  @IsString()
  @IsNotEmpty()
  applicant: string;

  @IsString()
  @IsNotEmpty()
  localGovernmentUuid: string;

  @IsString()
  @IsNotEmpty()
  regionCode: string;

  @IsString()
  @IsNotEmpty()
  boardCode: string;

  @IsString()
  @IsOptional()
  typeCode: string;
}

export class NoticeOfIntentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileNumber: string;

  @AutoMap()
  applicant: string;

  @AutoMap()
  card: CardDto;

  @AutoMap()
  localGovernment: LocalGovernmentDto;

  @AutoMap()
  region: ApplicationRegionDto;

  feePaidDate?: number;

  @AutoMap(() => Boolean)
  feeWaived?: boolean | null;

  @AutoMap(() => Boolean)
  feeSplitWithLg?: boolean | null;

  @AutoMap(() => Number)
  feeAmount?: number | null;

  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  dateSubmittedToAlc?: number;
  activeDays: number | null;
  pausedDays: number | null;
  paused: boolean;
  decisionDate: number;

  @AutoMap(() => Boolean)
  retroactive: boolean | null;

  @AutoMap(() => String)
  summary?: string;

  @AutoMap(() => [NoticeOfIntentSubtypeDto])
  subtype: NoticeOfIntentSubtypeDto[];

  @AutoMap(() => NoticeOfIntentTypeDto)
  type: NoticeOfIntentTypeDto;

  @AutoMap()
  source: 'ALCS' | 'APPLICANT';

  @AutoMap(() => String)
  alrArea?: number;

  @AutoMap(() => String)
  agCap?: string;

  @AutoMap(() => String)
  agCapSource?: string;

  @AutoMap(() => String)
  agCapMap?: string;

  @AutoMap(() => String)
  agCapConsultant?: string;

  @AutoMap(() => String)
  staffObservations?: string;

  proposalEndDate?: number;
  
  @AutoMap(() => String)
  legacyId?: string;
}

export class UpdateNoticeOfIntentDto {
  @IsOptional()
  @IsNumber()
  dateSubmittedToAlc?: number;

  @IsOptional()
  @IsNumber()
  feePaidDate?: number;

  @IsBoolean()
  @IsOptional()
  feeWaived?: boolean | null;

  @IsBoolean()
  @IsOptional()
  feeSplitWithLg?: boolean | null;

  @IsOptional()
  @IsNumber()
  feeAmount?: number | null;

  @IsOptional()
  @IsNumber()
  dateAcknowledgedIncomplete?: number;

  @IsOptional()
  @IsNumber()
  dateReceivedAllItems?: number;

  @IsOptional()
  @IsNumber()
  dateAcknowledgedComplete?: number;

  @IsOptional()
  @IsUUID()
  localGovernmentUuid?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsArray()
  @IsOptional()
  subtype?: string[];

  @IsBoolean()
  @IsOptional()
  retroactive?: boolean;

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
  staffObservations?: string;

  @IsOptional()
  @IsNumber()
  proposalEndDate?: number;
}

export class CreateNoticeOfIntentServiceDto {
  fileNumber: string;
  applicant: string;
  typeCode: string;
  dateSubmittedToAlc?: Date | null | undefined;
  regionCode?: string;
  localGovernmentUuid?: string;
  source?: 'ALCS' | 'APPLICANT';
  subtypes?: string[];
}
