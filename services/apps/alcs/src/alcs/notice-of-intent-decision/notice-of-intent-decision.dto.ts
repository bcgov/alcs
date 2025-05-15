import { AutoMap } from 'automapper-classes';
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';
import {
  NoticeOfIntentDecisionComponentDto,
  UpdateNoticeOfIntentDecisionComponentDto,
} from './notice-of-intent-decision-component/notice-of-intent-decision-component.dto';
import {
  NoticeOfIntentDecisionConditionDto,
  UpdateNoticeOfIntentDecisionConditionDto,
} from './notice-of-intent-decision-condition/notice-of-intent-decision-condition.dto';
import { UserDto } from '../../user/user.dto';
import { Type } from 'class-transformer';
import { NoticeOfIntentDecisionConditionCardUuidDto } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.dto';

export class NoticeOfIntentDecisionOutcomeCodeDto extends BaseCodeDto {}

export class UpdateNoticeOfIntentDecisionDto {
  @IsNumber()
  @IsOptional()
  resolutionNumber?: number;

  @IsNumber()
  @IsOptional()
  resolutionYear?: number;

  @IsNumber()
  @IsOptional()
  date?: number;

  @IsNumber()
  @IsOptional()
  auditDate?: number | null;

  @IsString()
  @IsOptional()
  outcomeCode?: string;

  @IsString()
  @IsOptional()
  decisionMaker?: string | null;

  @IsString()
  @IsOptional()
  decisionMakerName?: string | null;

  @IsUUID()
  @IsOptional()
  modifiesUuid?: string | null;

  @IsBoolean()
  @IsOptional()
  isSubjectToConditions?: boolean | null;

  @IsString()
  @IsOptional()
  decisionDescription?: string | null;

  @IsNumber()
  @IsOptional()
  rescindedDate?: number | null;

  @IsString()
  @IsOptional()
  rescindedComment?: string | null;

  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @IsOptional()
  decisionComponents?: UpdateNoticeOfIntentDecisionComponentDto[];

  @IsOptional()
  @IsArray()
  conditions?: UpdateNoticeOfIntentDecisionConditionDto[];

  @IsDate()
  @IsOptional()
  emailSent?: Date | null;

  @IsOptional()
  @IsArray()
  ccEmails?: string[];

  @IsOptional()
  @IsBoolean()
  isFlagged?: boolean;

  @IsOptional()
  @IsString()
  reasonFlagged?: string | null;

  @IsOptional()
  @IsNumber()
  followUpAt?: number | null;

  @IsOptional()
  @IsString()
  flaggedByUuid?: string | null;

  @IsOptional()
  @IsString()
  flagEditedByUuid?: string | null;

  @IsOptional()
  @IsNumber()
  flagEditedAt?: number | null;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}

export class CreateNoticeOfIntentDecisionDto extends UpdateNoticeOfIntentDecisionDto {
  @IsString()
  fileNumber: string;

  @IsOptional()
  override isDraft = true;

  @IsString()
  @IsOptional()
  decisionToCopy?: string;
}

export class LinkedResolutionDto {
  uuid: string;
  linkedResolutions: string[];
}

export class NoticeOfIntentDecisionDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileNumber: string;

  date: number;
  auditDate: number;
  createdAt: number;

  @AutoMap()
  resolutionNumber: string;

  @AutoMap()
  resolutionYear: number;

  @AutoMap(() => String)
  decisionMaker: string | null;

  @AutoMap(() => String)
  decisionMakerName: string | null;

  @AutoMap(() => Boolean)
  wasReleased: boolean;

  @AutoMap(() => Boolean)
  isSubjectToConditions: boolean | null;

  @AutoMap(() => Boolean)
  isDraft: boolean;

  @AutoMap(() => String)
  decisionDescription?: string | null;

  @AutoMap(() => Number)
  rescindedDate?: number | null;

  @AutoMap(() => String)
  rescindedComment?: string | null;

  @AutoMap(() => [NoticeOfIntentDecisionDocumentDto])
  documents: NoticeOfIntentDecisionDocumentDto[];

  @AutoMap(() => NoticeOfIntentDecisionOutcomeCodeDto)
  outcome?: NoticeOfIntentDecisionOutcomeCodeDto | null;

  modifies?: LinkedResolutionDto;
  modifiedBy?: LinkedResolutionDto[];

  components?: NoticeOfIntentDecisionComponentDto[];

  @AutoMap(() => [NoticeOfIntentDecisionConditionDto])
  conditions?: NoticeOfIntentDecisionConditionDto[];

  @AutoMap(() => [NoticeOfIntentDecisionConditionCardUuidDto])
  conditionCards?: NoticeOfIntentDecisionConditionCardUuidDto[];

  @AutoMap(() => Boolean)
  isFlagged: boolean;

  @AutoMap(() => String)
  reasonFlagged: string | null;

  @AutoMap(() => Number)
  followUpAt: number | null;

  @AutoMap(() => UserDto)
  flaggedBy: UserDto | null;

  @AutoMap(() => UserDto)
  flagEditedBy: UserDto | null;

  @AutoMap(() => Number)
  flagEditedAt: number | null;

  canDraftBeDeleted: boolean;
}

export class NoticeOfIntentDecisionDocumentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  documentUuid: string;

  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}
