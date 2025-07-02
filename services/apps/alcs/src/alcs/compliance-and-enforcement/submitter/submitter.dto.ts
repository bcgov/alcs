import { AutoMap } from 'automapper-classes';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ComplianceAndEnforcementDto } from '../compliance-and-enforcement.dto';

export class ComplianceAndEnforcementSubmitterDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  dateAdded: number | null;

  @AutoMap()
  isAnonymous: boolean;

  @AutoMap()
  name: string;

  @AutoMap()
  email: string;

  @AutoMap()
  telephoneNumber: string;

  @AutoMap()
  affiliation: string;

  @AutoMap()
  additionalContactInformation: string;
}

export class UpdateComplianceAndEnforcementSubmitterDto {
  @IsOptional()
  @IsNumber()
  dateAdded?: number | null;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telephoneNumber?: string;

  @IsOptional()
  @IsString()
  affiliation?: string;

  @IsOptional()
  @IsString()
  additionalContactInformation?: string;

  @IsOptional()
  @AutoMap()
  fileUuid?: string;
}
