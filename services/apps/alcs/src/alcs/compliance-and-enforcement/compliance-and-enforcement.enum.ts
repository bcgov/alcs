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

export enum InspectionType {
  INITIAL = 'Initial',
  FOLLOW_UP = 'Follow-up',
}

export enum OrderType {
  STOP_WORK_ORDER = 'Stop Work Order',
  PENALTY_ORDER = 'Penalty Order',
  REMEDIATION_ORDER = 'Remediation Order',
  INFORMATION_ORDER = 'Information Order',
  COURT_ORDER = 'Court Order',
}
