import { AutoMap } from '@automapper/classes';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApplicationLocalGovernmentDto } from '../application/application-code/application-local-government/application-local-government.dto';
import { ApplicationDecisionMeetingDto } from '../application/application-decision-meeting/application-decision-meeting.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';

export class ApplicationAmendmentCreateDto {
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  applicationFileNumber: string;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  applicationTypeCode: string;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  applicant: string;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  regionCode: string;

  @IsString()
  localGovernmentUuid: string;

  @AutoMap()
  @IsNumber()
  @IsDefined()
  submittedDate: number;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  boardCode: string;

  @AutoMap()
  @IsBoolean()
  isTimeExtension: boolean;
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
}
