export enum InitialSubmissionType {
  COMPLAINT = 'Complaint',
  REFERRAL = 'Referral',
}

export enum AllegedActivity {
  BREACH_OF_CONDITION = 'Breach of Condition',
  EXTRACTION = 'Extraction',
  FILL = 'Fill',
  NON_FARM_USE = 'Non-Farm Use',
  OTHER = 'Other',
  RESIDENCE = 'Residence',
}

export interface ComplianceAndEnforcementDto {
  uuid: string;
  fileNumber: string;
  dateSubmitted: number | null;
  dateOpened: number | null;
  dateClosed: number | null;
  initialSubmissionType: InitialSubmissionType | null;
  allegedContraventionNarrative: string;
  allegedActivity: AllegedActivity[];
  intakeNotes: string;
}

export interface UpdateComplianceAndEnforcementDto {
  dateSubmitted?: number | null;
  dateOpened?: number | null;
  dateClosed?: number | null;
  initialSubmissionType?: InitialSubmissionType | null;
  allegedContraventionNarrative?: string;
  allegedActivity?: AllegedActivity[];
  intakeNotes?: string;
}
