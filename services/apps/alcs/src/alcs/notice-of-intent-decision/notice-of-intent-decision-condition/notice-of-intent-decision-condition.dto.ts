import { AutoMap } from 'automapper-classes';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { NoticeOfIntentDecisionComponentDto } from '../notice-of-intent-decision-component/notice-of-intent-decision-component.dto';
import {
  DateLabel,
  DateType,
} from '../../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { Type } from 'class-transformer';
import { NoticeOfIntentDecisionConditionDateDto } from './notice-of-intent-decision-condition-date/notice-of-intent-decision-condition-date.dto';
import {
  NoticeOfIntentDecisionConditionCardUuidDto,
  NoticeOfIntentDecisionConditionHomeCardDto,
} from './notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.dto';
import { NoticeOfIntentTypeDto } from '../../notice-of-intent/notice-of-intent-type/notice-of-intent-type.dto';

export class NoticeOfIntentDecisionConditionTypeDto extends BaseCodeDto {
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
  @IsEnum(DateLabel)
  @IsOptional()
  singleDateLabel: DateLabel | null;

  @AutoMap()
  @IsEnum(DateType)
  @IsOptional()
  dateType: DateType | null;

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
  components?: NoticeOfIntentDecisionComponentDto[];

  @AutoMap()
  dates?: NoticeOfIntentDecisionConditionDateDto[];

  @AutoMap(() => NoticeOfIntentDecisionConditionCardUuidDto)
  conditionCard: NoticeOfIntentDecisionConditionCardUuidDto | null;

  status?: string | null;
}

export class NoticeOfIntentHomeDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  applicant: string;

  @AutoMap()
  fileNumber: string;

  @AutoMap(() => NoticeOfIntentTypeDto)
  type: NoticeOfIntentTypeDto;

  activeDays?: number;
  paused: boolean;
  pausedDays: number;
}

export class NoticeOfIntentDecisionHomeDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  noticeOfIntent: NoticeOfIntentHomeDto;
}

export class NoticeOfIntentDecisionConditionHomeDto {
  @AutoMap(() => NoticeOfIntentDecisionConditionHomeCardDto)
  conditionCard: NoticeOfIntentDecisionConditionHomeCardDto | null;

  status?: string | null;
  isReconsideration: boolean;
  isModification: boolean;

  @AutoMap()
  decision?: NoticeOfIntentDecisionHomeDto;
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
  @AutoMap()
  dates?: NoticeOfIntentDecisionConditionDateDto[];

  @IsOptional()
  @IsUUID()
  conditionCardUuid?: string;
}

export class UpdateNoticeOfIntentDecisionConditionServiceDto {
  componentDecisionUuid?: string;
  componentToConditionType?: string;
  approvalDependant?: boolean;
  securityAmount?: number;
  administrativeFee?: number;
  description?: string;
  dates?: NoticeOfIntentDecisionConditionDateDto[];
  conditionCardUuid?: string;
}
