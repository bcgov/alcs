import { AutoMap } from '@automapper/classes';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';
import { ApplicationLocalGovernmentDto } from '../application/application-code/application-local-government/application-local-government.dto';
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
  localGovernment: ApplicationLocalGovernmentDto;

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
