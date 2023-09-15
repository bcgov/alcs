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

export interface NonApplicationSearchResultDto {
  type: string | null;
  applicant: string | null;
  referenceId: string | null;
  localGovernmentName: string | null;
  fileNumber: string;
  boardCode: string | null;
  class: 'PLAN' | 'COV';
}

export interface AdvancedSearchResponseDto {
  applications: ApplicationSearchResultDto[];
  noticeOfIntents: NoticeOfIntentSearchResultDto[];
  nonApplications: NonApplicationSearchResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
  totalNonApplications: number;
}

export interface AdvancedSearchEntityResponseDto<T> {
  data: T[];
  total: number;
}

export interface PagingRequestDto {
  pageSize: number;
  page: number;
  sortField: string;
  sortDirection: string;
}

export interface SearchRequestDto extends PagingRequestDto {
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
  fileTypes: string[];
}

export interface NonApplicationsSearchRequestDto extends PagingRequestDto {
  fileNumber?: string;
  governmentName?: string;
  regionCode?: string;
  name?: string;
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
