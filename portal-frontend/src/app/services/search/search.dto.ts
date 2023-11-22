export interface BaseSearchResultDto {
  fileNumber: string;
  type: string;
  referenceId: string;
  applicant?: string;
  localGovernmentName: string;
  boardCode?: string;
  ownerName: string;
  dateSubmitted: number;
  lastUpdate: number;
  status?: string;
  class: string;
}

export interface ApplicationSearchResultDto extends BaseSearchResultDto {}
export interface NoticeOfIntentSearchResultDto extends BaseSearchResultDto {}
export interface NotificationSearchResultDto extends BaseSearchResultDto {}

export interface SearchResponseDto {
  applications: ApplicationSearchResultDto[];
  noticeOfIntents: NoticeOfIntentSearchResultDto[];
  notifications: NotificationSearchResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
  totalNotifications: number;
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
  name?: string;
  pid?: string;
  civicAddress?: string;
  portalStatusCodes?: string[];
  governmentName?: string;
  regionCodes?: string[];
  decisionMakerCode?: string;
  dateDecidedFrom?: number;
  dateDecidedTo?: number;
  fileTypes: string[];
  decisionOutcome?: string[];
}

export const displayedColumns = ['fileId', 'ownerName', 'type', 'portalStatus', 'lastUpdate', 'government'];

export const  outcomeMapping: Record<string, string> = {
  'APPR': "Approved",
  'REFU': "Refused",
  'RESC': "Rescinded",
  'ONTP': "Ordered not to Proceed (NOI)"
}