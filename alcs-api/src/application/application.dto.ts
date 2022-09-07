import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserDto } from '../user/user.dto';
import { ApplicationRegionDto } from './application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from './application-code/application-type/application-type.dto';
import { ApplicationDecisionMeetingDto } from './application-decision-meeting/application-decision-meeting.dto';
import { ApplicationStatusDto } from './application-status/application-status.dto';

export class CreateApplicationDto {
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  applicant: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  dateReceived: number;

  @IsString()
  @IsOptional()
  region?: string;
}

export class ApplicationDto {
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  applicant: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @AutoMap()
  @IsUUID()
  assigneeUuid?: string;

  @AutoMap()
  assignee?: UserDto;

  @AutoMap()
  activeDays: number;

  @AutoMap()
  pausedDays: number;

  @AutoMap()
  @IsBoolean()
  paused: boolean;

  @AutoMap()
  @IsBoolean()
  highPriority: boolean;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  board: string;

  @IsNotEmpty()
  @IsNumber()
  dateReceived: number;

  @IsNumber()
  datePaid?: number;

  @IsOptional()
  @IsNumber()
  dateAcknowledgedIncomplete?: number;

  @IsOptional()
  @IsNumber()
  dateReceivedAllItems?: number;

  @IsOptional()
  @IsNumber()
  dateAcknowledgedComplete?: number;

  @IsOptional()
  @IsNumber()
  decisionDate?: number;

  @IsOptional()
  @IsString()
  region?: string;

  @AutoMap()
  @Type(() => ApplicationDecisionMeetingDto)
  decisionMeetings: ApplicationDecisionMeetingDto[];
}

export class ApplicationDetailedDto extends ApplicationDto {
  @AutoMap()
  statusDetails: ApplicationStatusDto;

  @AutoMap()
  typeDetails: ApplicationTypeDto;

  @AutoMap()
  regionDetails: ApplicationRegionDto;
}

export class ApplicationUpdateDto {
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  applicant?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  type?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  region?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  status?: string;

  @AutoMap()
  @IsOptional()
  @IsUUID()
  assigneeUuid?: string;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  paused?: boolean;

  @IsOptional()
  @IsNumber()
  dateReceived?: number;

  @IsOptional()
  @IsNumber()
  datePaid?: number;

  @IsOptional()
  @IsNumber()
  dateAcknowledgedIncomplete?: number;

  @IsOptional()
  @IsNumber()
  dateReceivedAllItems?: number;

  @IsOptional()
  @IsNumber()
  dateAcknowledgedComplete?: number;

  @IsOptional()
  @IsNumber()
  decisionDate?: number;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  highPriority?: boolean;
}
