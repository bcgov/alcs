import { IsDate, IsObject, IsString } from 'class-validator';

export class ApplicationDecisionConditionDateDto {
  @IsString()
  uuid?: string;

  @IsDate()
  date?: Date;

  @IsDate()
  completedDate?: Date | null;

  @IsString()
  comment?: string;
}
