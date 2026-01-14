import { AutoMap } from 'automapper-classes';
import { IsNumber, IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { AllegedActivity, InitialSubmissionType } from './compliance-and-enforcement.entity';
import {
  ComplianceAndEnforcementSubmitterDto,
  UpdateComplianceAndEnforcementSubmitterDto,
} from './submitter/submitter.dto';
import { Type } from 'class-transformer';
import { ComplianceAndEnforcementPropertyDto } from './property/property.dto';
import { UserDto } from '../../user/user.dto';

export class ComplianceAndEnforcementDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileNumber: string;

  @AutoMap()
  dateSubmitted: number | null;

  @AutoMap()
  dateOpened: number | null;

  @AutoMap()
  dateClosed: number | null;

  @AutoMap()
  initialSubmissionType: InitialSubmissionType | null;

  @AutoMap()
  allegedContraventionNarrative: string;

  @AutoMap()
  allegedActivity: AllegedActivity[];

  @AutoMap()
  intakeNotes: string;

  @AutoMap()
  submitters?: ComplianceAndEnforcementSubmitterDto[];

  @AutoMap()
  property?: ComplianceAndEnforcementPropertyDto;

  @AutoMap()
  chronologyClosedAt: number | null;

  @AutoMap()
  chronologyClosedBy?: UserDto;

  @AutoMap()
  assignee?: UserDto;
}

export class UpdateComplianceAndEnforcementDto {
  @IsOptional()
  @IsNumber()
  dateSubmitted?: number | null;

  @IsOptional()
  @IsNumber()
  dateOpened?: number | null;

  @IsOptional()
  @IsNumber()
  dateClosed?: number | null;

  @IsOptional()
  @IsEnum(InitialSubmissionType)
  initialSubmissionType?: string | null;

  @IsOptional()
  @IsString()
  allegedContraventionNarrative?: string;

  @IsOptional()
  @IsEnum(AllegedActivity, { each: true })
  allegedActivity?: string[];

  @IsOptional()
  @IsString()
  intakeNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateComplianceAndEnforcementSubmitterDto)
  submitters?: UpdateComplianceAndEnforcementSubmitterDto[];

  @IsOptional()
  @IsNumber()
  chronologyClosedAt?: number | null;

  @IsOptional()
  @IsString()
  chronologyClosedByUuid?: string | null;

  @IsOptional()
  @IsString()
  assigneeUuid?: string | null;
}
