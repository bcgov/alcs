import { IsDate, IsString } from 'class-validator';

export class NoticeOfIntentDecisionConditionDateDto {
  @IsString()
  uuid?: string;

  @IsDate()
  date?: Date;

  @IsString()
  comment?: string;
}
