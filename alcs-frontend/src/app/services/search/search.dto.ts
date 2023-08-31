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

export interface NoticeOfIntentSearchResultDto extends ApplicationSearchResultDto {}

export interface AdvancedSearchResponseDto {
  applications: ApplicationSearchResultDto[];
  noticeOfIntents: NoticeOfIntentSearchResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
}

export interface AdvancedSearchEntityResponseDto<T> {
  data: T[];
  total: number;
}

export interface SearchRequestDto {
  pageSize: number;
  page: number;
  sortField: string;
  sortDirection: string;
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
  applicationFileTypes: string[];
}

export interface SearchResultDto {
  fileNumber: string;
  type: string;
  referenceId: string;
  applicant?: string;
  localGovernmentName: string;
  boardCode?: string;
  label?: ApplicationTypeDto;
}
