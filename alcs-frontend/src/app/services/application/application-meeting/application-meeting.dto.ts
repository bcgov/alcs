export interface ApplicationMeetingDto {
  uuid: string;
  meetingStartDate: number;
  meetingEndDate?: number;
  reportStartDate?: number;
  reportEndDate?: number;
  meetingType: ApplicationMeetingTypeDto;
  description: string | null;
}

export interface ApplicationMeetingTypeDto {
  code: string;
  label: string;
}

export interface CreateApplicationMeetingDto {
  meetingStartDate: Date;
  meetingTypeCode: string;
  description?: string;
}

export interface UpdateApplicationMeetingDto {
  meetingStartDate?: Date;
  meetingEndDate?: Date | null;
  reportStartDate?: Date | null;
  reportEndDate?: Date | null;
  description?: string | null;
}
