export interface ApplicationDecisionDto extends CreateApplicationDecisionDto {
  uuid: string;
}

export interface CreateApplicationDecisionDto {
  date: number;
  applicationFileNumber: string;
  outcome: string;
}

export interface UpdateApplicationDecisionDto {
  date: number;
  outcome: string;
}
