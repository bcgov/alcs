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

  @IsOptional()
  @IsString()
  nfuUseTypeCode?: string;

  @IsOptional()
  @IsString()
  nfuUseSubTypeCode?: string;

  @IsOptional()
  @IsNumber()
  nfuEndDate?: number;

  @IsString()
  applicationDecisionComponentTypeCode: string;
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
  nfuUseType?: string;

  @AutoMap()
  nfuUseSubType?: string;

  @AutoMap()
  nfuEndDate?: number;

  @AutoMap()
  applicationDecisionUuid: string;

  @AutoMap(() => ApplicationDecisionComponentTypeDto)
  applicationDecisionComponentType;
}
