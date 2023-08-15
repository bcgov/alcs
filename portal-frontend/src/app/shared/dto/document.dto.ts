import { BaseCodeDto } from './base.dto';

export enum DOCUMENT_TYPE {
  //ALCS
  DECISION_DOCUMENT = 'DPAC',
  OTHER = 'OTHR',

  //Government Review
  RESOLUTION_DOCUMENT = 'RESO',
  STAFF_REPORT = 'STFF',

  //Applicant Uploaded
  CORPORATE_SUMMARY = 'CORS',
  PROFESSIONAL_REPORT = 'PROR',
  PHOTOGRAPH = 'PHTO',
  AUTHORIZATION_LETTER = 'AAGR',
  CERTIFICATE_OF_TITLE = 'CERT',

  //App Documents
  SERVING_NOTICE = 'POSN',
  PROPOSAL_MAP = 'PRSK',
  HOMESITE_SEVERANCE = 'HOME',
  CROSS_SECTIONS = 'SPCS',
  RECLAMATION_PLAN = 'RECP',
  NOTICE_OF_WORK = 'NOWE',
  PROOF_OF_SIGNAGE = 'POSA',
  REPORT_OF_PUBLIC_HEARING = 'ROPH',
  PROOF_OF_ADVERTISING = 'POAA',
}

export enum DOCUMENT_SOURCE {
  APPLICANT = 'Applicant',
  ALC = 'ALC',
  LFNG = 'L/FNG',
  AFFECTED_PARTY = 'Affected Party',
  PUBLIC = 'Public',
}

export interface DocumentTypeDto extends BaseCodeDto {
  code: DOCUMENT_TYPE;
}
