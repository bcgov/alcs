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

export interface NotificationSearchResultDto extends ApplicationSearchResultDto {}

export interface PlanningReviewSearchResultDto {
  type: string | null;
  documentName: string | null;
  referenceId: string | null;
  localGovernmentName: string | null;
  dateSubmitted: number;
  fileNumber: string;
  class: 'PLAN';
  open: boolean;
}

export interface InquirySearchResultDto {
  type: string | null;
  documentName: string | null;
  referenceId: string | null;
  localGovernmentName: string | null;
  fileNumber: string;
  class: 'INQR';
  open: boolean;
}

export interface AdvancedSearchResponseDto {
  applications: ApplicationSearchResultDto[];
  noticeOfIntents: NoticeOfIntentSearchResultDto[];
  planningReviews: PlanningReviewSearchResultDto[];
  notifications: NotificationSearchResultDto[];
  inquiries: InquirySearchResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
  totalPlanningReviews: number;
  totalNotifications: number;
  totalInquiries: number;
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
  resolutionNumber?: number;
  resolutionYear?: number;
  portalStatusCodes?: string[];
  governmentName?: string;
  regionCode?: string;
  dateSubmittedFrom?: number;
  dateSubmittedTo?: number;
  dateDecidedFrom?: number;
  dateDecidedTo?: number;
  fileTypes: string[];
  tags?: string[];
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
