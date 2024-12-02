import { IsDate, IsString } from 'class-validator';

export class NoticeOfIntentDecisionConditionDateDto {
  @IsString()
  uuid?: string;

  @IsDate()
  date?: Date;

  @IsDate()
  completedDate?: Date | null;

  @IsString()
  comment?: string;
}
