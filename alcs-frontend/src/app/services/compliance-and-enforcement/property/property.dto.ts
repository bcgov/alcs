import { BaseCodeDto } from '../../../shared/dto/base.dto';

export interface ComplianceAndEnforcementPropertyDto {
  uuid: string;
  fileUuid: string;
  civicAddress: string;
  legalDescription: string;
  localGovernmentUuid: string;
  regionCode: string;
  latitude: number;
  longitude: number;
  ownershipTypeCode: string;
  pid?: string | null;
  pin?: string | null;
  areaHectares: number;
  alrPercentage: number;
  alcHistory: string;
  localGovernment?: BaseCodeDto;
  ownershipType?: BaseCodeDto;
}

export interface UpdateComplianceAndEnforcementPropertyDto {
  civicAddress?: string | null;
  legalDescription?: string | null;
  localGovernmentUuid?: string | null;
  regionCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ownershipTypeCode?: string | null;
  pid?: string | null;
  pin?: string | null;
  areaHectares?: number | null;
  alrPercentage?: number | null;
  alcHistory?: string | null;
  fileUuid?: string | null;
}

export interface CreateComplianceAndEnforcementPropertyDto {
  civicAddress: string;
  legalDescription: string;
  localGovernmentUuid: string;
  regionCode?: string;
  latitude: number;
  longitude: number;
  ownershipTypeCode: string;
  pid?: string | null;
  pin?: string | null;
  areaHectares: number;
  alrPercentage: number;
  alcHistory: string;
  fileUuid: string;
} 