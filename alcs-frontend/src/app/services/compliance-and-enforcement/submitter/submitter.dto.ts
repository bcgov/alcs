export interface ComplianceAndEnforcementSubmitterDto {
  uuid: string;
  dateAdded: number | null;
  isAnonymous: boolean;
  name: string;
  email: string;
  telephoneNumber: string;
  affiliation: string;
  additionalContactInformation: string;
}

export interface UpdateComplianceAndEnforcementSubmitterDto {
  dateAdded?: number | null;
  isAnonymous?: boolean;
  name?: string;
  email?: string;
  telephoneNumber?: string;
  affiliation?: string;
  additionalContactInformation?: string;
  fileUuid?: string;
}
