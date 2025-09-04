import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsBoolean, ValidateNested } from 'class-validator';

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

// Needed to package DTO with UUID while providing a constructor for validation
export class BulkUpdateComplianceAndEnforcementSubmitterItemDto {
  @IsString()
  uuid: string;

  @ValidateNested()
  @Type(() => UpdateComplianceAndEnforcementSubmitterDto)
  dto: UpdateComplianceAndEnforcementSubmitterDto;
}

export class BulkUpdateComplianceAndEnforcementSubmitterDto {
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateComplianceAndEnforcementSubmitterItemDto)
  submitters: BulkUpdateComplianceAndEnforcementSubmitterItemDto[];
}
