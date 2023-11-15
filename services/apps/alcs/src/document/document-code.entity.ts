import { AutoMap } from 'automapper-classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../common/entities/base.code.entity';

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
  SERVING_NOTICE = 'POSN',
  PROPOSAL_MAP = 'PRSK',
  HOMESITE_SEVERANCE = 'HOME',
  CROSS_SECTIONS = 'SPCS',
  RECLAMATION_PLAN = 'RECP',
  NOTICE_OF_WORK = 'NOWE',
  PROOF_OF_SIGNAGE = 'POSA',
  REPORT_OF_PUBLIC_HEARING = 'ROPH',
  PROOF_OF_ADVERTISING = 'POAA',
  BUILDING_PLAN = 'BLDP',
  SRW_TERMS = 'SRTD',
  SURVEY_PLAN = 'SURV',

  //Notifications
  LTSA_LETTER = 'LTSA',
  ACKNOWLEDGEMENT_LETTER = 'ACKL',

  ORIGINAL_SUBMISSION = 'SUBO',
  UPDATED_SUBMISSION = 'SUBU',
}

export const DOCUMENT_TYPES = Object.values(DOCUMENT_TYPE);

export const DEFAULT_PUBLIC_TYPES = [
  DOCUMENT_TYPE.PROPOSAL_MAP,
  DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
  DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING,
  DOCUMENT_TYPE.CROSS_SECTIONS,
];

@Entity()
export class DocumentCode extends BaseCodeEntity {
  constructor(data?: Partial<DocumentCode>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'text', unique: true })
  oatsCode: string;

  @Column({ nullable: true })
  portalLabel?: string;
}
