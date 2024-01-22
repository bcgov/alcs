export interface BaseInboxResultDto {
  fileNumber: string;
  type: string;
  referenceId: string;
  ownerName?: string;
  createdAt: number;
  lastUpdate: number;
  status: string;
  class: string;
}

export interface ApplicationInboxResultDto extends BaseInboxResultDto {}
export interface NoticeOfIntentInboxResultDto extends BaseInboxResultDto {}
export interface NotificationInboxResultDto extends BaseInboxResultDto {}

export interface InboxSearchResponseDto {
  applications: ApplicationInboxResultDto[];
  noticeOfIntents: NoticeOfIntentInboxResultDto[];
  notifications: NotificationInboxResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
  totalNotifications: number;
}

export interface InboxResponseDto<T> {
  data: T[];
  total: number;
}

export interface PagingRequestDto {
  pageSize: number;
  page: number;
}

export interface InboxRequestDto extends PagingRequestDto {
  fileNumber?: string;
  name?: string;
  pid?: string;
  civicAddress?: string;
  portalStatusCodes?: string[];
  governmentFileNumber?: string;
  fileTypes: string[];
  filterBy?: string;
}
