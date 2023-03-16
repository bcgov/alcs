import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from '../../../document/document.entity';
import { Application } from '../application.entity';

export enum DOCUMENT_TYPE {
  //ALCS
  DECISION_DOCUMENT = 'decisionDocument',
  REVIEW_DOCUMENT = 'reviewDocument',

  //Government Review
  RESOLUTION_DOCUMENT = 'reviewResolutionDocument',
  STAFF_REPORT = 'reviewStaffReport',
  REVIEW_OTHER = 'reviewOther',

  //Applicant Uploaded
  CORPORATE_SUMMARY = 'corporateSummary',
  PROFESSIONAL_REPORT = 'Professional Report',
  PHOTOGRAPH = 'Photograph',
  OTHER = 'Other',
  AUTHORIZATION_LETTER = 'authorizationLetter',
  CERTIFICATE_OF_TITLE = 'certificateOfTitle',

  //TUR
  SERVING_NOTICE = 'servingNotice',
  PROPOSAL_MAP = 'proposalMap',
}

export const DOCUMENT_TYPES = [
  DOCUMENT_TYPE.DECISION_DOCUMENT,
  DOCUMENT_TYPE.REVIEW_DOCUMENT,
  DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
  DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
  DOCUMENT_TYPE.STAFF_REPORT,
  DOCUMENT_TYPE.REVIEW_OTHER,
  DOCUMENT_TYPE.CORPORATE_SUMMARY,
  DOCUMENT_TYPE.OTHER,
  DOCUMENT_TYPE.AUTHORIZATION_LETTER,
  DOCUMENT_TYPE.PROFESSIONAL_REPORT,
  DOCUMENT_TYPE.PHOTOGRAPH,
  DOCUMENT_TYPE.SERVING_NOTICE,
  DOCUMENT_TYPE.PROPOSAL_MAP,
];

@Entity()
export class ApplicationDocument extends BaseEntity {
  constructor(data?: Partial<ApplicationDocument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', nullable: true })
  type?: string | null; //FIXME: Automapper hates the DOCUMENT_TYPE type

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => Application, { nullable: false })
  application: Application;

  @Column()
  applicationUuid: string;

  @Column({ nullable: true })
  documentUuid?: string | null;

  @OneToOne(() => Document)
  @JoinColumn()
  document: Document;
}
