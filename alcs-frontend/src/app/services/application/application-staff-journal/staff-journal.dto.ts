export interface StaffJournalDto {
  uuid: string;
  body: string;
  author: string;
  edited: boolean;
  createdAt: number;
  isEditable: boolean;
}

export interface CreateApplicationStaffJournalDto {
  applicationUuid: string;
  body: string;
}

export interface CreateNoticeOfIntentStaffJournalDto {
  noticeOfIntentUuid: string;
  body: string;
}

export interface CreateNotificationStaffJournalDto {
  notificationUuid: string;
  body: string;
}

export interface CreatePlanningReviewStaffJournalDto {
  planningReviewUuid: string;
  body: string;
}

export interface CreateInquiryStaffJournalDto {
  inquiryUuid: string;
  body: string;
}

export interface UpdateStaffJournalDto {
  uuid: string;
  body: string;
}
