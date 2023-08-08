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
import { LocalGovernmentDto } from '../local-government/local-government.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';

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
}

export class UpdateNoticeOfIntentDto {
  @IsOptional()
  @IsNumber()
  dateSubmittedToAlc?: number;

  @IsOptional()
  @IsNumber()
  feePaidDate?: number;

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
}

export class CreateNoticeOfIntentServiceDto {
  fileNumber: string;
  applicant: string;
  typeCode: string;
  dateSubmittedToAlc?: Date | null | undefined;
  regionCode?: string;
  localGovernmentUuid?: string;
  source?: 'ALCS' | 'APPLICANT';
}
