import { AutoMap } from 'automapper-classes';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { ApplicationDecisionComponentDto } from '../application-decision-v2/application-decision/component/application-decision-component.dto';

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

  @AutoMap(() => String)
  componentUuid: string | null;

  @AutoMap()
  completionDate?: number;

  @AutoMap()
  supersededDate?: number;

  @AutoMap()
  components?: ApplicationDecisionComponentDto[];
}

export class ComponentToConditionDto {
  @IsOptional()
  @IsUUID()
  componentDecisionUuid?: string;

  @IsOptional()
  @IsString()
  componentToConditionType?: string;
}

export class UpdateApplicationDecisionConditionDto {
  @IsOptional()
  @IsString()
  uuid?: string;

  @IsOptional()
  @IsArray()
  componentsToCondition?: ComponentToConditionDto[];

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
  type?: ApplicationDecisionConditionTypeDto;

  @IsOptional()
  @IsNumber()
  completionDate?: number;

  @IsOptional()
  @IsNumber()
  supersededDate?: number;
}

export class UpdateApplicationDecisionConditionServiceDto {
  componentDecisionUuid?: string;
  componentToConditionType?: string;
  approvalDependant?: boolean;
  securityAmount?: number;
  administrativeFee?: number;
  description?: string;
  completionDate?: Date | null;
  supersededDate?: Date | null;
}

export class ApplicationDecisionConditionComponentDto {
  applicationDecisionConditionUuid: string;
  applicationDecisionComponentUuid: string;
  planNumbers: string | null;
}

export class UpdateApplicationDecisionConditionComponentDto {
  @IsString()
  applicationDecisionConditionUuid: string;

  @IsString()
  applicationDecisionComponentUuid: string;

  @IsString()
  @IsOptional()
  planNumbers: string | null;
}
