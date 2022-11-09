import { AutoMap } from '@automapper/classes';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApplicationLocalGovernmentDto } from '../../application/application-code/application-local-government/application-local-government.dto';
import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto } from '../../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../../code/application-code/application-type/application-type.dto';
import { ApplicationDecisionMeetingDto } from '../application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionDto } from '../application-decision/application-decision.dto';

export class ApplicationAmendmentCreateDto {
  @IsNotEmpty()
  @IsString()
  applicationFileNumber: string;

  @IsNotEmpty()
  @IsString()
  applicationTypeCode: string;

  @IsNotEmpty()
  @IsString()
  applicant: string;

  @IsNotEmpty()
  @IsString()
  regionCode: string;

  @IsString()
  localGovernmentUuid: string;

  @IsNumber()
  @IsDefined()
  submittedDate: number;

  @IsNotEmpty()
  @IsString()
  boardCode: string;

  @IsBoolean()
  isTimeExtension: boolean;

  @IsArray({})
  @ArrayNotEmpty()
  amendedDecisionUuids: string[];
}

export class ApplicationAmendmentUpdateDto {
  @AutoMap()
  @IsNumber()
  @IsOptional()
  submittedDate?: number;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  reviewDate?: number;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  isReviewApproved?: boolean | null;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  isTimeExtension?: boolean;

  @IsOptional()
  @IsArray({})
  @ArrayNotEmpty()
  amendedDecisionUuids?: string[];
}

export class ApplicationForAmendmentDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  statusCode: string;
  applicant: string;
  region: ApplicationRegionDto;
  localGovernment: ApplicationLocalGovernmentDto;
  decisionMeetings: ApplicationDecisionMeetingDto[];
}

export class ApplicationAmendmentDto {
  uuid: string;
  application: ApplicationForAmendmentDto;
  card: CardDto;
  submittedDate: number;
  reviewDate: number;
  isReviewApproved: boolean | null;
  isTimeExtension: boolean | null;
  amendedDecisions: ApplicationDecisionDto[];
  resultingDecision: ApplicationDecisionDto | null;
}
