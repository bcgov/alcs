export interface ApplicationDecisionMeetingDto {
  uuid: string;
  date: Date;
  applicationFileNumber: string;
}

export interface CreateApplicationDecisionMeetingDto {
  date: Date;
  applicationFileNumber: string;
}
