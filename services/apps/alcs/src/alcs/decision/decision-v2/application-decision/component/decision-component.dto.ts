import { AutoMap } from '@automapper/classes';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../../../../common/dtos/base.dto';

export class ApplicationDecisionComponentTypeDto extends BaseCodeDto {}

export class UpdateApplicationDecisionComponentDto {
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

  @IsOptional()
  @IsString()
  applicationDecisionComponentTypeCode?: string;
}

export class CreateApplicationDecisionComponentDto extends UpdateApplicationDecisionComponentDto {}

export class ApplicationDecisionComponentDto {
  @AutoMap()
  uuid: string;

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

  @AutoMap(() => ApplicationDecisionComponentTypeDto)
  applicationDecisionComponentType;
}
