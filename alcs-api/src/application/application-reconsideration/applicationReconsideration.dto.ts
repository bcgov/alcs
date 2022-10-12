import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CardDto } from '../../card/card.dto';
import { ApplicationRegionDto } from '../../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../../code/application-code/application-type/application-type.dto';
import { BaseCodeDto } from '../../common/dtos/base.dto';
import { ApplicationDecisionMeetingDto } from '../application-decision-meeting/application-decision-meeting.dto';

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
  region: string;

  @IsString()
  localGovernmentUuid: string;

  @AutoMap()
  @IsNumber()
  @IsNotEmpty()
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
  submittedDate: number;

  @AutoMap()
  @IsString()
  typeCode: string;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  reviewDate?: number;

  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isReviewApproved?: boolean;
}

export class ApplicationDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  applicant: string;
  region: ApplicationRegionDto;
  localGovernment: string;
  @AutoMap()
  @Type(() => ApplicationDecisionMeetingDto)
  decisionMeetings: ApplicationDecisionMeetingDto[];
}

export class ApplicationReconsiderationDto {
  uuid: string;
  application: ApplicationDto;
  card: CardDto;
  type: ReconsiderationTypeDto;
  submittedDate: Date;
}

export class ApplicationReconsiderationWithoutApplicationDto {
  uuid: string;
  applicationUuid: string;
  card: CardDto;
  type: ReconsiderationTypeDto;
  submittedDate: Date;
}
