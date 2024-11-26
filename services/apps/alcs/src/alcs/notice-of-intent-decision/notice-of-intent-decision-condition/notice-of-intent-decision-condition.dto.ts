import { AutoMap } from 'automapper-classes';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { NoticeOfIntentDecisionComponentDto } from '../notice-of-intent-decision-component/notice-of-intent-decision-component.dto';
import { DateLabel } from '../../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { Type } from 'class-transformer';

export class NoticeOfIntentDecisionConditionTypeDto extends BaseCodeDto {
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
  administrativeFeeAmount: number | null;

  @AutoMap()
  @IsBoolean()
  isSingleDateChecked: boolean;

  @AutoMap()
  @IsBoolean()
  isSingleDateRequired: boolean | null;

  @AutoMap()
  @IsEnum(DateLabel)
  singleDateLabel: DateLabel | null;

  @AutoMap()
  @IsBoolean()
  isSecurityAmountChecked: boolean;

  @AutoMap()
  @IsBoolean()
  isSecurityAmountRequired: boolean | null;
}
export class NoticeOfIntentDecisionConditionDto {
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

  @AutoMap(() => NoticeOfIntentDecisionConditionTypeDto)
  type: NoticeOfIntentDecisionConditionTypeDto;

  @AutoMap(() => String)
  componentUuid: string | null;

  @AutoMap()
  completionDate?: number;

  @AutoMap()
  singleDate?: number;

  @AutoMap()
  components?: NoticeOfIntentDecisionComponentDto[];
}

export class ComponentToConditionDto {
  @IsOptional()
  @IsUUID()
  componentDecisionUuid?: string;

  @IsOptional()
  @IsString()
  componentToConditionType?: string;
}

export class UpdateNoticeOfIntentDecisionConditionDto {
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
  type?: NoticeOfIntentDecisionConditionTypeDto;

  @IsOptional()
  @IsNumber()
  completionDate?: number;

  @IsOptional()
  @IsNumber()
  singleDate?: number;
}

export class UpdateNoticeOfIntentDecisionConditionServiceDto {
  componentDecisionUuid?: string;
  componentToConditionType?: string;
  approvalDependant?: boolean;
  securityAmount?: number;
  administrativeFee?: number;
  description?: string;
  completionDate?: Date | null;
  singleDate?: Date | null;
}
