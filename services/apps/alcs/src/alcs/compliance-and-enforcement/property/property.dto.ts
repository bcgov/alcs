import { AutoMap } from 'automapper-classes';
import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class ComplianceAndEnforcementPropertyDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileUuid: string;

  @AutoMap()
  civicAddress: string;

  @AutoMap()
  legalDescription: string;

  @AutoMap()
  localGovernmentUuid: string;

  @AutoMap()
  regionCode: string;

  @AutoMap()
  latitude: number;

  @AutoMap()
  longitude: number;

  @AutoMap()
  ownershipTypeCode: string;

  @AutoMap()
  pid: string | null;

  @AutoMap()
  pin: string | null;

  @AutoMap()
  areaHectares: number;

  @AutoMap()
  alrPercentage: number;

  @AutoMap()
  alcHistory: string;
}

export class UpdateComplianceAndEnforcementPropertyDto {
  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsString()
  civicAddress?: string | null;

  @IsOptional()
  @IsString()
  legalDescription?: string | null;

  @IsOptional()
  @IsUUID()
  localGovernmentUuid?: string | null;

  @IsOptional()
  @IsString()
  regionCode?: string | null;

  @IsOptional()
  @IsString()
  ownershipTypeCode?: string | null;

  @IsOptional()
  @IsString()
  pid?: string | null;

  @IsOptional()
  @IsString()
  pin?: string | null;

  @IsOptional()
  @IsNumber()
  areaHectares?: number | null;

  @IsOptional()
  @IsNumber()
  alrPercentage?: number | null;

  @IsOptional()
  @IsString()
  alcHistory?: string | null;

  @IsOptional()
  @AutoMap()
  fileUuid?: string;
} 