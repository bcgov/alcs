import { AutoMap } from '@automapper/classes';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../../../../common/dtos/base.dto';

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
  applicationDecisionUuid: string;

  @AutoMap()
  applicationDecisionComponentTypeCode: string;

  @AutoMap(() => ApplicationDecisionComponentTypeDto)
  applicationDecisionComponentType: ApplicationDecisionComponentTypeDto;
}

export enum APPLICATION_DECISION_COMPONENT_TYPE {
  NFUP = 'NFUP',
  TURP = 'TURP',
}
