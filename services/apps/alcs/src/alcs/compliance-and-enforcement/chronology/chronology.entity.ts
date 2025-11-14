import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';
import { ComplianceAndEnforcementDocument } from '../document/document.entity';
import { Auditable } from '../../../common/entities/audit.entity';

@Entity({
  comment: 'Compliance and enforcement chronology entry',
})
export class ComplianceAndEnforcementChronologyEntry extends Auditable {
  constructor(data?: Partial<ComplianceAndEnforcementChronologyEntry>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap()
  @Column({ type: 'boolean', default: false })
  isDraft: boolean;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  date: Date | null;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  description: string;

  @ManyToOne(() => ComplianceAndEnforcement, (file) => file.chronologyEntries)
  file: ComplianceAndEnforcement;

  @OneToMany(() => ComplianceAndEnforcementDocument, (document) => document.chronologyEntry)
  documents: ComplianceAndEnforcementDocument[];
}
