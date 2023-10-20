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
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { LocalGovernmentDto } from '../../local-government/local-government.dto';
import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto } from '../../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../../code/application-code/application-type/application-type.dto';
import { ApplicationDecisionMeetingDto } from '../application-decision-v1/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionDto } from '../application-decision-v1/application-decision/application-decision.dto';

export class ApplicationModificationOutcomeCodeDto extends BaseCodeDto {}

export class ApplicationModificationCreateDto {
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
  description: string;

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
  modifiesDecisionUuids: string[];
}

export class ApplicationModificationUpdateDto {
  @IsNumber()
  @IsOptional()
  submittedDate?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reviewOutcomeCode?: string;

  @IsBoolean()
  @IsOptional()
  isTimeExtension?: boolean;

  @IsOptional()
  @IsArray({})
  @ArrayNotEmpty()
  modifiesDecisionUuids?: string[];
}

export class ApplicationForModificationDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  statusCode: string;
  applicant: string;
  region: ApplicationRegionDto;
  localGovernment: LocalGovernmentDto;
  decisionMeetings: ApplicationDecisionMeetingDto[];
}

export class ApplicationModificationDto {
  uuid: string;
  application: ApplicationForModificationDto;
  card: CardDto;
  submittedDate: number;
  description: string;
  reviewOutcome: ApplicationModificationOutcomeCodeDto | null;
  isTimeExtension: boolean | null;
  modifiesDecisions: ApplicationDecisionDto[];
  resultingDecision: ApplicationDecisionDto | null;
}
