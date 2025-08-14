import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { LocalGovernmentDto } from '../../admin-local-government/admin-local-government.dto';

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
  pid?: string;
  pin?: string | null;
  areaHectares: number;
  alrPercentage: number;
  alcHistory: string;
  localGovernment?: LocalGovernmentDto;
  ownershipType?: BaseCodeDto;
  certificateOfTitleUuid?: string;
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
  certificateOfTitleUuid?: string;
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
  certificateOfTitleUuid?: string;
}
