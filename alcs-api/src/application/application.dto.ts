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
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { ApplicationLocalGovernmentDto } from './application-code/application-local-government/application-local-government.dto';
import { ApplicationDecisionMeetingDto } from './application-decision-meeting/application-decision-meeting.dto';

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @IsNotEmpty()
  @IsString()
  applicant: string;

  @IsNotEmpty()
  @IsString()
  typeCode: string;

  @IsNotEmpty()
  @IsNumber()
  dateReceived: number;

  @IsString()
  @IsOptional()
  regionCode?: string;

  @IsNotEmpty()
  @IsString()
  localGovernmentUuid: string;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsNumber()
  dateReceived?: number;

  @AutoMap()
  @IsOptional()
  @IsString()
  applicant?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  typeCode?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  regionCode?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  statusCode?: string;

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

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  highPriority?: boolean;

  @AutoMap()
  @IsString()
  @IsOptional()
  summary?: string;

  @IsOptional()
  @IsNumber()
  notificationSentDate?: number;
}

export class ApplicationDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  applicant: string;

  @AutoMap()
  assigneeUuid?: string;

  @AutoMap()
  activeDays: number;

  @AutoMap()
  pausedDays: number;

  @AutoMap()
  paused: boolean;

  @AutoMap()
  highPriority: boolean;

  @AutoMap()
  type: ApplicationTypeDto;

  board: string;

  @AutoMap()
  dateReceived: number;

  @AutoMap()
  datePaid?: number;

  @AutoMap()
  dateAcknowledgedIncomplete?: number;

  @AutoMap()
  dateReceivedAllItems?: number;

  @AutoMap()
  dateAcknowledgedComplete?: number;

  @AutoMap()
  decisionDate?: number;

  @AutoMap()
  notificationSentDate?: number;

  @AutoMap()
  summary?: string;

  @AutoMap()
  region: ApplicationRegionDto;

  localGovernment: ApplicationLocalGovernmentDto;

  @AutoMap()
  @Type(() => ApplicationDecisionMeetingDto)
  decisionMeetings: ApplicationDecisionMeetingDto[];

  @AutoMap()
  @Type(() => CardDto)
  card: CardDto;
}

export class ApplicationUpdateServiceDto {
  dateReceived?: Date | null | undefined;
  applicant?: string;
  typeCode?: string;
  regionCode?: string;
  datePaid?: Date | null | undefined;
  dateAcknowledgedIncomplete?: Date | null | undefined;
  dateReceivedAllItems?: Date | null | undefined;
  dateAcknowledgedComplete?: Date | null | undefined;
  decisionDate?: Date | null | undefined;
  summary?: string;
  notificationSentDate?: Date | null;
}
