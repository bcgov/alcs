import { ApplicationTypeDto } from '../application/application-code.dto';

export interface ApplicationSearchResultDto {
  fileNumber: string;
  type: ApplicationTypeDto;
  referenceId: string;
  applicant?: string;
  localGovernmentName: string;
  boardCode?: string;
  ownerName: string;
  dateSubmitted: number;
  portalStatus?: string;
  class: string;
  status: string;
}

export interface SearchResultDto {
  data: ApplicationSearchResultDto[];
  total: number;
}

export interface SearchRequestDto {
  pageSize: number;
  page: number;
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
