import { AutoMap } from 'automapper-classes';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ResponsiblePartyType, FOIPPACategory } from './entities';

export class ComplianceAndEnforcementResponsiblePartyDirectorDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  directorName: string;

  @AutoMap()
  directorMailingAddress: string;

  @AutoMap()
  directorTelephone?: string;

  @AutoMap()
  directorEmail?: string;
}

export class ComplianceAndEnforcementResponsiblePartyDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  partyType: ResponsiblePartyType;

  @AutoMap()
  foippaCategory: FOIPPACategory;

  @AutoMap()
  isPrevious: boolean;

  // Individual fields
  @AutoMap()
  individualName?: string;

  @AutoMap()
  individualMailingAddress?: string;

  @AutoMap()
  individualTelephone?: string;

  @AutoMap()
  individualEmail?: string;

  @AutoMap()
  individualNote?: string;

  // Organization fields
  @AutoMap()
  organizationName?: string;

  @AutoMap()
  organizationTelephone?: string;

  @AutoMap()
  organizationEmail?: string;

  @AutoMap()
  organizationNote?: string;

  @AutoMap()
  directors?: ComplianceAndEnforcementResponsiblePartyDirectorDto[];

  // Property Owner specific
  @AutoMap()
  ownerSince?: number | null;

  @AutoMap()
  fileUuid: string;
}

export class CreateComplianceAndEnforcementResponsiblePartyDirectorDto {
  @IsString()
  directorName: string;

  @IsString()
  directorMailingAddress: string;

  @IsOptional()
  @IsString()
  directorTelephone?: string;

  @IsOptional()
  @IsString()
  directorEmail?: string;
}

export class UpdateComplianceAndEnforcementResponsiblePartyDirectorDto {
  @IsOptional()
  @IsString()
  directorName?: string;

  @IsOptional()
  @IsString()
  directorMailingAddress?: string;

  @IsOptional()
  @IsString()
  directorTelephone?: string;

  @IsOptional()
  @IsString()
  directorEmail?: string;
}

export class CreateComplianceAndEnforcementResponsiblePartyDto {
  @IsEnum(ResponsiblePartyType)
  partyType: ResponsiblePartyType;

  @IsEnum(FOIPPACategory)
  foippaCategory: FOIPPACategory;

  @IsOptional()
  @IsBoolean()
  isPrevious?: boolean;

  @IsUUID()
  fileUuid: string;

  // Individual fields
  @IsOptional()
  @IsString()
  individualName?: string;

  @IsOptional()
  @IsString()
  individualMailingAddress?: string;

  @IsOptional()
  @IsString()
  individualTelephone?: string;

  @IsOptional()
  @IsString()
  individualEmail?: string;

  @IsOptional()
  @IsString()
  individualNote?: string;

  // Organization fields
  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  organizationTelephone?: string;

  @IsOptional()
  @IsString()
  organizationEmail?: string;

  @IsOptional()
  @IsString()
  organizationNote?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateComplianceAndEnforcementResponsiblePartyDirectorDto)
  directors?: CreateComplianceAndEnforcementResponsiblePartyDirectorDto[];

  // Property Owner specific
  @IsOptional()
  @IsNumber()
  ownerSince?: number | null;
}

export class UpdateComplianceAndEnforcementResponsiblePartyDto {
  @IsOptional()
  @IsEnum(ResponsiblePartyType)
  partyType?: ResponsiblePartyType;

  @IsOptional()
  @IsEnum(FOIPPACategory)
  foippaCategory?: FOIPPACategory;

  @IsOptional()
  @IsBoolean()
  isPrevious?: boolean;

  // Individual fields
  @IsOptional()
  @IsString()
  individualName?: string;

  @IsOptional()
  @IsString()
  individualMailingAddress?: string;

  @IsOptional()
  @IsString()
  individualTelephone?: string;

  @IsOptional()
  @IsString()
  individualEmail?: string;

  @IsOptional()
  @IsString()
  individualNote?: string;

  // Organization fields
  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  organizationTelephone?: string;

  @IsOptional()
  @IsString()
  organizationEmail?: string;

  @IsOptional()
  @IsString()
  organizationNote?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateComplianceAndEnforcementResponsiblePartyDirectorDto)
  directors?: UpdateComplianceAndEnforcementResponsiblePartyDirectorDto[];

  // Property Owner specific
  @IsOptional()
  @IsNumber()
  ownerSince?: number | null;
}
