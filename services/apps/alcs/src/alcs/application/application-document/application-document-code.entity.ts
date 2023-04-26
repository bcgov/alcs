import { AutoMap } from '@automapper/classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

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

  //TUR
  SERVING_NOTICE = 'POSN',
  PROPOSAL_MAP = 'PRSK',

  //SUBD
  HOMESITE_SEVERANCE = 'HOME',

  ORIGINAL_SUBMISSION = 'SUBO',
  UPDATED_SUBMISSION = 'SUBU',
}

export const DOCUMENT_TYPES = [
  DOCUMENT_TYPE.DECISION_DOCUMENT,
  DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
  DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
  DOCUMENT_TYPE.STAFF_REPORT,
  DOCUMENT_TYPE.CORPORATE_SUMMARY,
  DOCUMENT_TYPE.OTHER,
  DOCUMENT_TYPE.AUTHORIZATION_LETTER,
  DOCUMENT_TYPE.PROFESSIONAL_REPORT,
  DOCUMENT_TYPE.PHOTOGRAPH,
  DOCUMENT_TYPE.SERVING_NOTICE,
  DOCUMENT_TYPE.PROPOSAL_MAP,
  DOCUMENT_TYPE.HOMESITE_SEVERANCE,
];

@Entity()
export class ApplicationDocumentCode extends BaseCodeEntity {
  constructor(data?: Partial<ApplicationDocumentCode>) {
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
