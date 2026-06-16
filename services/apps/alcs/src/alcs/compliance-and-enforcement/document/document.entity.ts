import { AutoMap } from 'automapper-classes';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DocumentCode } from '../../../document/document-code.entity';
import { Document } from '../../../document/document.entity';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology/chronology.entity';
import { ComplianceAndEnforcementChronologyInspection } from '../chronology/inspection/inspection.entity';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';

export enum Section {
  SUBMISSION = 'Submission',
  OWNERSHIP = 'Ownership',
  MAPS = 'Maps',
  CHRONOLOGY_ENTRY = 'Chronology Entry',
}

@Entity({
  comment: "Links complaint/referral documents with the complaint/referral they're saved to and logs other attributes",
})
export class ComplianceAndEnforcementDocument extends BaseEntity {
  constructor(data?: Partial<ComplianceAndEnforcementDocument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => DocumentCode, { cascade: true })
  type?: DocumentCode;

  @ManyToOne(() => ComplianceAndEnforcement, { nullable: false })
  file: ComplianceAndEnforcement;

  @ManyToOne(() => ComplianceAndEnforcementChronologyEntry, { nullable: true, onDelete: 'CASCADE' })
  chronologyEntry: ComplianceAndEnforcementChronologyEntry | null;

  @ManyToOne(() => ComplianceAndEnforcementChronologyInspection, { nullable: true, onDelete: 'CASCADE' })
  inspection: ComplianceAndEnforcementChronologyInspection | null;

  @OneToOne(() => Document, { cascade: true })
  @JoinColumn()
  document: Document;

  @AutoMap()
  @Column({ type: 'enum', enum: Section })
  section: Section;
}
