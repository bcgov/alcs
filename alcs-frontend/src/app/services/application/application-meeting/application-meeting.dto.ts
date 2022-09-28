export interface ApplicationMeetingDto {
  uuid: string;
  startDate: number;
  endDate?: number;
  meetingType: ApplicationMeetingTypeDto;
  description: string | null;
}

export interface ApplicationMeetingTypeDto {
  code: string;
  label: string;
}

export interface CreateApplicationMeetingDto extends UpdateApplicationMeetingDto {
  meetingTypeCode: string;
}

export interface UpdateApplicationMeetingDto {
  startDate: Date;
  endDate: Date | null;
  description: string | undefined | null;
}
