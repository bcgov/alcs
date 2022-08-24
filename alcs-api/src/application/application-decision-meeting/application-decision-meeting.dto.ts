import { AutoMap } from '@automapper/classes';
import { IsNumber, IsString } from 'class-validator';

export class CreateApplicationDecisionMeetingDto {
  @AutoMap()
  @IsNumber()
  date: number;

  @AutoMap()
  @IsString()
  applicationFileNumber;
}

export class ApplicationDecisionMeetingDto extends CreateApplicationDecisionMeetingDto {
  @AutoMap()
  @IsString()
  uuid: string;
}
