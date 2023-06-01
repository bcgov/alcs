export interface NoticeOfIntentMeetingDto {
  uuid: string;
  meetingStartDate: number;
  meetingEndDate?: number;
  meetingType: NoticeOfIntentMeetingTypeDto;
  description: string | null;
}

export interface NoticeOfIntentMeetingTypeDto {
  code: string;
  label: string;
}

export interface CreateNoticeOfIntentMeetingDto {
  meetingStartDate: Date;
  meetingEndDate?: Date;
  meetingTypeCode: string;
  description?: string;
}

export interface UpdateNoticeOfIntentMeetingDto {
  meetingStartDate?: Date;
  meetingEndDate?: Date | null;
  description?: string | null;
}
