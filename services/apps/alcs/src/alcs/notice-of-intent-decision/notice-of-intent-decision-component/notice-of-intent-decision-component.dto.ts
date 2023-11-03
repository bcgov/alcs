import { AutoMap } from '@automapper/classes';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

export class NoticeOfIntentDecisionComponentTypeDto extends BaseCodeDto {}

export class UpdateNoticeOfIntentDecisionComponentDto {
  @IsString()
  uuid: string;

  @IsOptional()
  @IsString()
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

  @IsString()
  noticeOfIntentDecisionComponentTypeCode: string;

  @IsOptional()
  @IsNumber()
  endDate?: number;

  @IsOptional()
  @IsNumber()
  endDate2?: number;

  @IsOptional()
  @IsNumber()
  expiryDate?: number;

  @IsOptional()
  @IsString()
  soilFillTypeToPlace?: string;

  @IsNumber()
  @IsOptional()
  soilToPlaceVolume?: number | null;

  @IsNumber()
  @IsOptional()
  soilToPlaceArea?: number | null;

  @IsNumber()
  @IsOptional()
  soilToPlaceMaximumDepth?: number | null;

  @IsNumber()
  @IsOptional()
  soilToPlaceAverageDepth?: number | null;

  @IsOptional()
  @IsString()
  soilTypeRemoved?: string;

  @IsNumber()
  @IsOptional()
  soilToRemoveVolume?: number | null;

  @IsNumber()
  @IsOptional()
  soilToRemoveArea?: number | null;

  @IsNumber()
  @IsOptional()
  soilToRemoveMaximumDepth?: number | null;

  @IsNumber()
  @IsOptional()
  soilToRemoveAverageDepth?: number | null;
}

export class CreateNoticeOfIntentDecisionComponentDto extends UpdateNoticeOfIntentDecisionComponentDto {
  @IsOptional()
  @IsString()
  override uuid: string;
}

export class NoticeOfIntentDecisionComponentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  alrArea?: number;

  @AutoMap()
  agCap?: string;

  @AutoMap()
  agCapSource?: string;

  @AutoMap()
  agCapMap?: string;

  @AutoMap()
  agCapConsultant?: string;

  endDate?: number;
  endDate2?: number;
  expiryDate?: number;

  @AutoMap()
  noticeOfIntentDecisionUuid: string;

  @AutoMap()
  soilFillTypeToPlace?: string;

  @AutoMap()
  soilToPlaceVolume?: number;

  @AutoMap()
  soilToPlaceArea?: number;

  @AutoMap()
  soilToPlaceMaximumDepth?: number;

  @AutoMap()
  soilToPlaceAverageDepth?: number;

  @AutoMap()
  soilTypeRemoved?: string;

  @AutoMap()
  soilToRemoveVolume?: number;

  @AutoMap()
  soilToRemoveArea?: number;

  @AutoMap()
  soilToRemoveMaximumDepth?: number;

  @AutoMap()
  soilToRemoveAverageDepth?: number;

  @AutoMap()
  noticeOfIntentDecisionComponentTypeCode: string;

  @AutoMap(() => NoticeOfIntentDecisionComponentTypeDto)
  noticeOfIntentDecisionComponentType: NoticeOfIntentDecisionComponentTypeDto;
}

export enum NOI_DECISION_COMPONENT_TYPE {
  POFO = 'POFO',
  ROSO = 'ROSO',
  PFRS = 'PFRS',
}
