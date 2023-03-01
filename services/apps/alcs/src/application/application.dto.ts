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
import { ApplicationReviewGrpc } from '../application-grpc/alcs-application.message.interface';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { ApplicationDecisionMeetingDto } from '../decision/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationLocalGovernmentDto } from './application-code/application-local-government/application-local-government.dto';
import { StatusHistory } from './application.entity';

export class ApplicationReviewDto {
  @AutoMap()
  localGovernmentFileNumber: string;

  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  position: string;

  @AutoMap()
  department: string;

  @AutoMap()
  phoneNumber: string;

  @AutoMap()
  email: string;

  @AutoMap(() => Boolean)
  isOCPDesignation: boolean | null;

  @AutoMap(() => String)
  OCPBylawName: string | null;

  @AutoMap(() => String)
  OCPDesignation: string | null;

  @AutoMap(() => Boolean)
  OCPConsistent: boolean | null;

  @AutoMap(() => Boolean)
  isSubjectToZoning: boolean | null;

  @AutoMap(() => String)
  zoningBylawName: string | null;

  @AutoMap(() => String)
  zoningDesignation: string | null;

  @AutoMap(() => String)
  zoningMinimumLotSize: string | null;

  @AutoMap(() => Boolean)
  isZoningConsistent: boolean | null;

  @AutoMap(() => Boolean)
  isAuthorized: boolean | null;
}

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
  dateSubmittedToAlc: number;

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
  dateSubmittedToAlc?: number;

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

  activeDays: number;

  pausedDays: number;

  paused: boolean;

  dateSubmittedToAlc?: number;
  datePaid?: number;

  dateAcknowledgedIncomplete?: number;

  dateReceivedAllItems?: number;

  dateAcknowledgedComplete?: number;

  decisionDate?: number;

  notificationSentDate?: number;

  @AutoMap(() => ApplicationTypeDto)
  type: ApplicationTypeDto;

  @AutoMap(() => String)
  summary: string | null;

  @AutoMap(() => ApplicationRegionDto)
  region: ApplicationRegionDto;

  @AutoMap(() => ApplicationLocalGovernmentDto)
  localGovernment: ApplicationLocalGovernmentDto;

  @AutoMap(() => ApplicationDecisionMeetingDto)
  decisionMeetings: ApplicationDecisionMeetingDto[];

  @AutoMap(() => [StatusHistory])
  statusHistory?: StatusHistory[];

  @AutoMap()
  @Type(() => CardDto)
  card?: CardDto;

  @AutoMap()
  @Type(() => ApplicationReviewDto)
  applicationReview?: ApplicationReviewDto;
}

export class ApplicationUpdateServiceDto {
  dateSubmittedToAlc?: Date | null | undefined;
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

export class CreateApplicationServiceDto {
  fileNumber: string;
  applicant: string;
  typeCode: string;
  dateSubmittedToAlc?: Date | null | undefined;
  regionCode?: string;
  localGovernmentUuid: string;
  statusHistory?: StatusHistory[];
  applicationReview?: ApplicationReviewGrpc;
}
