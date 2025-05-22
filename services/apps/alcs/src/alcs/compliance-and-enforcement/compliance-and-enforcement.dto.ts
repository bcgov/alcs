import { AutoMap } from 'automapper-classes';
import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { AllegedActivity, InitialSubmissionType } from './compliance-and-enforcement.entity';

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
}
