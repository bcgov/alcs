export interface ApplicationMeetingDto {
  uuid: string;
  startDate: Date;
  endDate: Date;
  applicationFileNumber: string;
  meetingType: ApplicationMeetingTypeDto;
  description: string | null;
}

export interface ApplicationMeetingTypeDto {
  code: string;
  label: string;
}

export interface CreateApplicationMeetingDto {
  startDate: Date;
  endDate: Date | null;
  applicationFileNumber: string;
  meetingTypeCode: string;
  description: string | undefined;
}

export interface UpdateApplicationMeetingDto extends CreateApplicationMeetingDto {
  uuid: string;
}
