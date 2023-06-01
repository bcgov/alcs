import { AutoMap } from '@automapper/classes';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto } from '../../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../../code/application-code/application-type/application-type.dto';
import { ApplicationDecisionMeetingDto } from '../application-decision-v1/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionDto } from '../application-decision-v1/application-decision/application-decision.dto';

export class ReconsiderationTypeDto extends BaseCodeDto {}

export class ApplicationReconsiderationOutcomeCodeDto extends BaseCodeDto {}

export class ApplicationReconsiderationCreateDto {
  @IsString()
  applicationTypeCode: string;

  @IsNotEmpty()
  @IsString()
  applicationFileNumber: string;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  applicant: string;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  regionCode: string;

  @AutoMap()
  @IsString()
  localGovernmentUuid: string;

  @AutoMap()
  @IsNumber()
  @IsDefined()
  submittedDate: number;

  @IsNotEmpty()
  @IsString()
  reconTypeCode: string;

  @IsNotEmpty()
  @IsString()
  boardCode: string;

  @IsArray()
  @ArrayNotEmpty()
  reconsideredDecisionUuids: string[];
}

export class ApplicationReconsiderationUpdateDto {
  @IsNumber()
  @IsOptional()
  submittedDate?: number;

  @IsString()
  @IsOptional()
  typeCode?: string;

  @IsNumber()
  @IsOptional()
  reviewDate?: number | null;

  @IsString()
  @IsOptional()
  reviewOutcomeCode?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  reconsideredDecisionUuids?: string[];
}

export class ApplicationForReconsiderationDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  statusCode: string;
  applicant: string;
  region: ApplicationRegionDto;
  localGovernment: string;
  decisionMeetings: ApplicationDecisionMeetingDto[];
}

export class ApplicationReconsiderationDto {
  uuid: string;
  application: ApplicationForReconsiderationDto;
  card: CardDto;
  type: ReconsiderationTypeDto;
  submittedDate: number;
  reviewDate: number;
  reviewOutcome: ApplicationReconsiderationOutcomeCodeDto | null;
  reconsideredDecisions: ApplicationDecisionDto[];
  resultingDecision?: ApplicationDecisionDto;
}

export class ApplicationReconsiderationWithoutApplicationDto {
  uuid: string;
  applicationUuid: string;
  card: CardDto;
  type: ReconsiderationTypeDto;
  submittedDate: number;
  reviewDate: number;
  reviewOutcome: ApplicationReconsiderationOutcomeCodeDto | null;
}
