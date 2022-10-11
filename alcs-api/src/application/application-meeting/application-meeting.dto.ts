import { AutoMap } from '@automapper/classes';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApplicationMeetingTypeDto } from '../../code/application-code/application-meeting-type/application-meeting-type.dto';

export class CreateApplicationMeetingDto {
  @AutoMap()
  @IsNumber()
  meetingStartDate: number;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  meetingEndDate?: number;

  @AutoMap()
  @IsString()
  meetingTypeCode: string;

  @AutoMap()
  @IsString()
  @IsOptional()
  description?: string;
}

export class ApplicationMeetingDto extends CreateApplicationMeetingDto {
  @AutoMap()
  @IsString()
  uuid: string;

  @AutoMap()
  meetingType: ApplicationMeetingTypeDto;

  @AutoMap()
  meetingEndDate?: number;

  @AutoMap()
  reportStartDate?: number;

  @AutoMap()
  reportEndDate?: number;
}

export class UpdateApplicationMeetingDto {
  @AutoMap()
  @IsOptional()
  @IsNumber()
  meetingStartDate?: number;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  meetingEndDate?: number | null;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  reportStartDate?: number | null;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  reportEndDate?: number | null;

  @AutoMap()
  @IsString()
  @IsOptional()
  description?: string;
}
