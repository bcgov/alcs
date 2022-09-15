import { AutoMap } from '@automapper/classes';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApplicationMeetingTypeDto } from '../application-code/application-meeting-type/application-meeting-type.dto';

export class CreateApplicationMeetingDto {
  @AutoMap()
  @IsNumber()
  startDate: number;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  endDate: number = null;

  @AutoMap()
  @IsString()
  meetingTypeCode: string;

  @AutoMap()
  @IsString()
  @IsOptional()
  description: string;
}

export class ApplicationMeetingDto extends CreateApplicationMeetingDto {
  @AutoMap()
  @IsString()
  uuid: string;

  @AutoMap()
  meetingType: ApplicationMeetingTypeDto;
}

export class UpdateApplicationMeetingDto {
  @AutoMap()
  @IsOptional()
  @IsNumber()
  startDate: number;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  endDate: number = null;

  @AutoMap()
  @IsString()
  @IsOptional()
  description: string;
}
