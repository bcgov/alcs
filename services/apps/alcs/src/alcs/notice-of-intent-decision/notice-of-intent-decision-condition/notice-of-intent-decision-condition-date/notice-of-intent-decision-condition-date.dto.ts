import { IsDate, IsString } from 'class-validator';

export class NoticeOfIntentDecisionConditionDateDto {
  @IsString()
  uuid?: string;

  @IsDate()
  date?: Date;

  @IsDate()
  completedDate?: Date;

  @IsString()
  comment?: string;
}
