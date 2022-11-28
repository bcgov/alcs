export interface ApplicationDto {
  fileNumber: string;
  createdAt: Date;
  applicant: string;
  localGovernmentUuid: string;
  documents: any[];
}

export interface CreateApplicationDto {
  applicant: string;
  localGovernmentUuid: string;
  documents: File[];
}
