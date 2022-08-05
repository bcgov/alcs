import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AutoMap } from '@automapper/classes';
import { UserDto } from '../user/user.dto';
import { ApplicationDecisionMakerDto } from './application-code/application-decision-maker/application-decision-maker.dto';
import { ApplicationStatusDto } from './application-status/application-status.dto';
import { ApplicationTypeDto } from './application-code/application-type/application-type.dto';

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

  @IsString()
  @IsOptional()
  decisionMaker?: string;
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

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsString()
  decisionMaker?: string;
}

export class ApplicationDetailedDto extends ApplicationDto {
  @AutoMap()
  statusDetails: ApplicationStatusDto;

  @AutoMap()
  typeDetails: ApplicationTypeDto;

  @AutoMap()
  decisionMakerDetails: ApplicationDecisionMakerDto;
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
  decisionMaker?: string;

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
}
