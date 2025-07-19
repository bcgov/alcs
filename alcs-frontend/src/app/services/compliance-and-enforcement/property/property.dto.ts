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
  civicAddress?: string;
  legalDescription?: string;
  localGovernmentUuid?: string;
  regionCode?: string;
  latitude?: number;
  longitude?: number;
  ownershipTypeCode?: string;
  pid?: string | null;
  pin?: string | null;
  areaHectares?: number;
  alrPercentage?: number;
  alcHistory?: string;
  fileUuid?: string;
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