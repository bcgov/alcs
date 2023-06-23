import { AutoMap } from '@automapper/classes';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../../../../common/dtos/base.dto';
import { NaruSubtypeDto } from '../../../../../portal/application-submission/application-submission.dto';

export class ApplicationDecisionComponentTypeDto extends BaseCodeDto {}

export class UpdateApplicationDecisionComponentDto {
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
  applicationDecisionComponentTypeCode: string;

  @IsOptional()
  @IsString()
  nfuType?: string;

  @IsOptional()
  @IsString()
  nfuSubType?: string;

  @IsOptional()
  @IsNumber()
  endDate?: number;

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

  @IsString()
  @IsOptional()
  naruSubtypeCode: string;
}

export class CreateApplicationDecisionComponentDto extends UpdateApplicationDecisionComponentDto {
  @IsOptional()
  @IsString()
  override uuid: string;
}

export class ApplicationDecisionComponentDto {
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

  @AutoMap()
  nfuType?: string;

  @AutoMap()
  nfuSubType?: string;

  @AutoMap()
  endDate?: number;

  @AutoMap()
  expiryDate?: number;

  @AutoMap()
  applicationDecisionUuid: string;

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
  applicationDecisionComponentTypeCode: string;

  @AutoMap(() => ApplicationDecisionComponentTypeDto)
  applicationDecisionComponentType: ApplicationDecisionComponentTypeDto;

  @AutoMap()
  naruSubtypeCode: string;

  @AutoMap(() => NaruSubtypeDto)
  naruSubtype: NaruSubtypeDto;
}

export enum APPLICATION_DECISION_COMPONENT_TYPE {
  NFUP = 'NFUP',
  TURP = 'TURP',
  POFO = 'POFO',
  ROSO = 'ROSO',
  PFRS = 'PFRS',
  NARU = 'NARU',
}
