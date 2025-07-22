import { AutoMap } from 'automapper-classes';
import { IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';

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
  regionCode: string | null;

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
  @IsString()
  civicAddress?: string;

  @IsOptional()
  @IsString()
  legalDescription?: string;

  @IsOptional()
  @IsUUID()
  localGovernmentUuid?: string;

  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  ownershipTypeCode?: string;

  @IsOptional()
  @IsString()
  pid?: string | null;

  @IsOptional()
  @IsString()
  pin?: string | null;

  @IsOptional()
  @IsNumber()
  areaHectares?: number;

  @IsOptional()
  @IsNumber()
  alrPercentage?: number;

  @IsOptional()
  @IsString()
  alcHistory?: string;

  @IsOptional()
  @IsUUID()
  fileUuid?: string;
} 