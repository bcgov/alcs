import { AutoMap } from '@automapper/classes';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

export class ApplicationDecisionConditionTypeDto extends BaseCodeDto {}
export class ApplicationDecisionConditionDto {
  @AutoMap()
  uuid: string;

  @AutoMap(() => Boolean)
  approvalDependant: boolean | null;

  @AutoMap(() => Number)
  securityAmount: number | null;

  @AutoMap(() => Number)
  administrativeFee: number | null;

  @AutoMap(() => String)
  description: string | null;

  @AutoMap(() => ApplicationDecisionConditionTypeDto)
  type: ApplicationDecisionConditionTypeDto;
}

export class UpdateApplicationDecisionConditionDto {
  @IsOptional()
  @IsString()
  uuid?: string;

  @IsOptional()
  @IsBoolean()
  approvalDependant?: boolean;

  @IsOptional()
  @IsNumber()
  securityAmount?: number;

  @IsOptional()
  @IsNumber()
  administrativeFee?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
