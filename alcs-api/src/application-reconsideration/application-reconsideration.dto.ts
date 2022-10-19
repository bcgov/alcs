import { AutoMap } from '@automapper/classes';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApplicationDecisionMeetingDto } from '../application/application-decision-meeting/application-decision-meeting.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { BaseCodeDto } from '../common/dtos/base.dto';

export class ReconsiderationTypeDto extends BaseCodeDto {}

export class ApplicationReconsiderationCreateDto {
  @AutoMap()
  @IsString()
  applicationTypeCode: string;

  @AutoMap()
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

  @IsString()
  localGovernmentUuid: string;

  @AutoMap()
  @IsNumber()
  @IsDefined()
  submittedDate: number;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  reconTypeCode: string;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  boardCode: string;
}

export class ApplicationReconsiderationUpdateDto {
  @AutoMap()
  @IsNumber()
  @IsOptional()
  submittedDate?: number;

  @AutoMap()
  @IsString()
  @IsOptional()
  typeCode?: string;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  reviewDate?: number;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  isReviewApproved?: boolean | null;
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
