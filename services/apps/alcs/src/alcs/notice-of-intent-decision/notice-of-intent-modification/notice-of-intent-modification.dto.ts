import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { LocalGovernmentDto } from '../../local-government/local-government.dto';
import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto } from '../../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../../code/application-code/application-type/application-type.dto';
import { NoticeOfIntentDecisionDto } from '../notice-of-intent-decision.dto';

export class NoticeOfIntentModificationOutcomeCodeDto extends BaseCodeDto {}

export class NoticeOfIntentModificationCreateDto {
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @IsNotEmpty()
  @IsString()
  applicant: string;

  @IsNotEmpty()
  @IsString()
  regionCode: string;

  @IsString()
  localGovernmentUuid: string;

  @IsNumber()
  @IsDefined()
  submittedDate: number;

  @IsNotEmpty()
  @IsString()
  boardCode: string;

  @IsArray({})
  @ArrayNotEmpty()
  modifiesDecisionUuids: string[];
}

export class NoticeOfIntentModificationUpdateDto {
  @IsNumber()
  @IsOptional()
  submittedDate?: number;

  @IsNumber()
  @IsOptional()
  reviewDate?: number;

  @IsNumber()
  @IsOptional()
  outcomeNotificationDate?: number | null;

  @IsString()
  @IsOptional()
  reviewOutcomeCode?: string;

  @IsOptional()
  @IsArray({})
  @ArrayNotEmpty()
  modifiesDecisionUuids?: string[];
}

export class NoticeOfIntentForModificationDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  statusCode: string;
  applicant: string;
  region: ApplicationRegionDto;
  retroactive: boolean;
  localGovernment: LocalGovernmentDto;
}

export class NoticeOfIntentModificationDto {
  uuid: string;
  noticeOfIntent: NoticeOfIntentForModificationDto;
  card: CardDto;
  submittedDate: number;
  reviewDate: number;
  reviewOutcome: NoticeOfIntentModificationOutcomeCodeDto | null;
  outcomeNotificationDate: number | null;
  modifiesDecisions: NoticeOfIntentDecisionDto[];
  resultingDecision: NoticeOfIntentDecisionDto | null;
}
