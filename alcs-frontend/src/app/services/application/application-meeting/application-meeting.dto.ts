export interface ApplicationMeetingDto {
  uuid: string;
  startDate: Date;
  endDate: Date;
  applicationFileNumber: string;
  meetingType: ApplicationMeetingTypeDto;
  meetingTypeCode: string;
}

export interface ApplicationMeetingTypeDto {
  code: string;
  label: string;
}

export interface CreateApplicationMeetingDto {
  startDate: Date;
  endDate: Date;
  applicationFileNumber: string;
  meetingTypeCode: string;
}

export interface UpdateApplicationMeetingDto extends CreateApplicationMeetingDto {
  uuid: string;
}
