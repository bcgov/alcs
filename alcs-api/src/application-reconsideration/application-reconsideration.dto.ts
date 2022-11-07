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
import { ApplicationDecisionMeetingDto } from '../application/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionDto } from '../application/application-decision/application-decision.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { BaseCodeDto } from '../common/dtos/base.dto';

export class ReconsiderationTypeDto extends BaseCodeDto {}

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
  reviewDate?: number;

  @IsBoolean()
  @IsOptional()
  isReviewApproved?: boolean | null;

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
  isReviewApproved: boolean | null;
  reconsideredDecisions: ApplicationDecisionDto[];
}

export class ApplicationReconsiderationWithoutApplicationDto {
  uuid: string;
  applicationUuid: string;
  card: CardDto;
  type: ReconsiderationTypeDto;
  submittedDate: number;
  reviewDate: number;
  isReviewApproved: boolean | null;
}
