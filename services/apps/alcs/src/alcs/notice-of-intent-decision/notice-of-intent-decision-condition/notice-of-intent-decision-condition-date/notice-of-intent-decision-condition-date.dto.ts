import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class NoticeOfIntentDecisionConditionDateDto {
  @IsString()
  uuid?: string;

  @Transform(({ value }) => value.getTime())
  @IsNumber()
  date?: number;

  @Transform(({ value }) => value && value.getTime())
  @IsNumber()
  completedDate?: number | null;

  @IsString()
  comment?: string;
}
