import { AutoMap } from '@automapper/classes';
import { IsNumber, IsString } from 'class-validator';
import { ApplicationMeetingTypeDto } from '../application-code/application-meeting-type/application-meeting-type.dto';

export class CreateApplicationMeetingDto {
  @AutoMap()
  @IsNumber()
  startDate: number;

  @AutoMap()
  @IsNumber()
  endDate: number;

  @AutoMap()
  @IsString()
  applicationFileNumber: string;

  @AutoMap()
  @IsString()
  meetingTypeCode: string;
}

export class ApplicationMeetingDto extends CreateApplicationMeetingDto {
  @AutoMap()
  @IsString()
  uuid: string;

  @AutoMap()
  meetingType: ApplicationMeetingTypeDto;
}
