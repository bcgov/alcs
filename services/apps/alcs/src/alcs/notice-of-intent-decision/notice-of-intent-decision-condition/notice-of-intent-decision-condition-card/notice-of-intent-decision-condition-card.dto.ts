import { AutoMap } from 'automapper-classes';
import { NoticeOfIntentDecisionConditionDto } from '../notice-of-intent-decision-condition.dto';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { CardDto } from '../../../card/card.dto';
import { NoticeOfIntentTypeDto } from '../../../notice-of-intent/notice-of-intent-type/notice-of-intent-type.dto';

export class NoticeOfIntentDecisionConditionCardDto {
  @AutoMap()
  @IsUUID()
  uuid: string;

  @IsArray()
  conditions: NoticeOfIntentDecisionConditionDto[];

  @AutoMap()
  @IsString()
  cardUuid: string;

  @AutoMap()
  card: CardDto;

  @IsString()
  decisionUuid?: string;

  @IsString()
  @IsOptional()
  noticeOfIntent?: string | null;
}

export class NoticeOfIntentDecisionConditionHomeCardDto {
  @AutoMap()
  @IsUUID()
  uuid: string;

  @IsArray()
  conditions: NoticeOfIntentDecisionConditionDto[];

  @AutoMap()
  @IsString()
  cardUuid: string;

  @AutoMap()
  card: CardDto;

  @IsString()
  @IsOptional()
  noticeOfIntentFileNumber?: string | null;
}

export class CreateNoticeOfIntentDecisionConditionCardDto {
  @AutoMap()
  @IsArray()
  conditionsUuids: string[];

  @AutoMap()
  @IsString()
  decisionUuid: string;

  @AutoMap()
  @IsString()
  cardStatusCode: string;
}

export class UpdateNoticeOfIntentDecisionConditionCardDto {
  @AutoMap()
  @IsArray()
  @IsOptional()
  conditionsUuids?: string[] | null;

  @AutoMap()
  @IsString()
  @IsOptional()
  cardStatusCode?: string | null;
}

export class NoticeOfIntentDecisionConditionCardUuidDto {
  @AutoMap()
  @IsUUID()
  uuid: string;
}

export class NoticeOfIntentDecisionConditionCardBoardDto {
  @AutoMap()
  @IsUUID()
  uuid: string;

  @IsArray()
  conditions: NoticeOfIntentDecisionConditionDto[];

  @AutoMap()
  card: CardDto;

  @IsString()
  decisionUuid: string;

  @IsNumber()
  decisionOrder: number;

  @IsBoolean()
  decisionIsFlagged: boolean;

  @IsString()
  fileNumber: string;

  @IsString()
  @IsOptional()
  applicant?: string | null;

  @IsOptional()
  type?: NoticeOfIntentTypeDto | null;

  @IsBoolean()
  isModification?: boolean;
}

export class UpdateNoticeOfIntentDecisionConditionBoardCardDto {
  @AutoMap()
  @IsString()
  cardStatusCode: string;
}
