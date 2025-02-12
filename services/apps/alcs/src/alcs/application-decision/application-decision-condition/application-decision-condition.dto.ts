import { AutoMap } from 'automapper-classes';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { ApplicationDecisionComponentDto } from '../application-decision-v2/application-decision/component/application-decision-component.dto';
import { DateLabel, DateType } from './application-decision-condition-code.entity';
import { Type } from 'class-transformer';
import { ApplicationDecisionConditionDateDto } from './application-decision-condition-date/application-decision-condition-date.dto';
import {
  ApplicationDecisionConditionCardUuidDto,
  ApplicationDecisionConditionHomeCardDto,
} from './application-decision-condition-card/application-decision-condition-card.dto';
import { ApplicationTypeDto } from '../../code/application-code/application-type/application-type.dto';

export class ApplicationDecisionConditionTypeDto extends BaseCodeDto {
  @IsBoolean()
  isActive: boolean;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  isComponentToConditionChecked: boolean;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  isDescriptionChecked: boolean;

  @AutoMap()
  @IsBoolean()
  isAdministrativeFeeAmountChecked: boolean;

  @AutoMap()
  @IsBoolean()
  isAdministrativeFeeAmountRequired: boolean | null;

  @AutoMap(() => Number)
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  administrativeFeeAmount: number | null;

  @AutoMap()
  @IsBoolean()
  isDateChecked: boolean;

  @AutoMap()
  @IsBoolean()
  isDateRequired: boolean | null;

  @AutoMap()
  @IsEnum(DateType)
  @IsOptional()
  dateType: DateType | null;

  @AutoMap()
  @IsEnum(DateLabel)
  @IsOptional()
  singleDateLabel: DateLabel | null;

  @AutoMap()
  @IsBoolean()
  isSecurityAmountChecked: boolean;

  @AutoMap()
  @IsBoolean()
  isSecurityAmountRequired: boolean | null;
}

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
  components?: ApplicationDecisionComponentDto[];

  @AutoMap()
  dates: ApplicationDecisionConditionDateDto[];

  @AutoMap(() => ApplicationDecisionConditionCardUuidDto)
  conditionCard: ApplicationDecisionConditionCardUuidDto | null;

  status?: string | null;
}

export class ApplicationHomeDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  applicant: string;

  @AutoMap()
  fileNumber: string;

  @AutoMap(() => ApplicationTypeDto)
  type: ApplicationTypeDto;

  activeDays: number;
  paused: boolean;
  pausedDays: number;
}

export class ApplicationDecisionHomeDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  application: ApplicationHomeDto;
}

export class ApplicationDecisionConditionHomeDto {
  @AutoMap(() => ApplicationDecisionConditionHomeCardDto)
  conditionCard: ApplicationDecisionConditionHomeCardDto | null;

  status?: string | null;
  isReconsideration: boolean;
  isModification: boolean;

  @AutoMap()
  decision?: ApplicationDecisionHomeDto;
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
  @IsArray()
  dates?: ApplicationDecisionConditionDateDto[];

  @IsOptional()
  @IsUUID()
  conditionCardUuid?: string;
}

export class UpdateApplicationDecisionConditionServiceDto {
  componentDecisionUuid?: string;
  componentToConditionType?: string;
  approvalDependant?: boolean;
  securityAmount?: number;
  administrativeFee?: number;
  description?: string;
  dates?: ApplicationDecisionConditionDateDto[];
  conditionCardUuid?: string;
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
