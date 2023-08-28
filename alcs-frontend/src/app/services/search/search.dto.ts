import { ApplicationTypeDto } from '../application/application-code.dto';

export interface SearchResultDto {
  fileNumber: string;
  type: string;
  referenceId: string;
  applicant?: string;
  localGovernmentName: string;
  boardCode?: string;
  label?: ApplicationTypeDto;
  ownerName: string;
  dateSubmitted: number;
  portalStatus?: string;
}

export interface SearchRequestDto {
  fileNumber?: string;
  legacyId?: string;
  name?: string;
  pid?: string;
  civicAddress?: string;
  isIncludeOtherParcels: boolean;
  resolutionNumber?: number;
  resolutionYear?: number;
  portalStatusCode?: string;
  governmentName?: string;
  regionCode?: string;
  dateSubmittedFrom?: number;
  dateSubmittedTo?: number;
  dateDecidedFrom?: number;
  dateDecidedTo?: number;
}
