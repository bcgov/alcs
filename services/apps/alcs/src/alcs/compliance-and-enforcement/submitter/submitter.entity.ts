import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';

@Entity({
  comment: 'Compliance and enforcement submitter',
})
export class ComplianceAndEnforcementSubmitter {
  constructor(data?: Partial<ComplianceAndEnforcementSubmitter>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  dateAdded: Date;

  @AutoMap()
  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  name: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  email: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  telephoneNumber: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  affiliation: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  additionalContactInformation: string;

  @ManyToOne(() => ComplianceAndEnforcement, (file) => file.submitters)
  file: ComplianceAndEnforcement;
}
