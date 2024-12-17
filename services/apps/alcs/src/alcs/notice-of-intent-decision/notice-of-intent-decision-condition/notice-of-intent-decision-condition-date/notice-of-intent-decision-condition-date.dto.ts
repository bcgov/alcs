import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class NoticeOfIntentDecisionConditionDateDto {
  @IsString()
  uuid?: string;

  @Transform(({ value }) => (value ? new Date(value).getTime() : null))
  @IsNumber()
  @IsOptional()
  date?: number | null;

  @Transform(({ value }) => (value ? new Date(value).getTime() : null))
  @IsNumber()
  @IsOptional()
  completedDate?: number | null;

  @IsString()
  @IsOptional()
  comment?: string | null;
}

export class CreateNoticeOfIntentDecisionConditionDateDto {
  @IsString()
  conditionUuid: string;
}
