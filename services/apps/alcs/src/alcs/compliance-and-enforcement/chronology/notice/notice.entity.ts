import { AutoMap } from 'automapper-classes';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AllegedActivity, NoticeType } from '../../compliance-and-enforcement.enum';
import { ComplianceAndEnforcementDocument } from '../../document/document.entity';
import { ComplianceAndEnforcementResponsiblePartyDirector } from '../../responsible-parties/responsible-party-director.entity';
import { ComplianceAndEnforcementResponsibleParty } from '../../responsible-parties/responsible-party.entity';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology.entity';
import { ComplianceAndEnforcementNoticeDueDate } from './due-date/due-date.entity';
import { NoticeNotification } from './notice.dto';

@Entity({
  comment: 'Compliance and enforcement chronology entry',
})
export class ComplianceAndEnforcementNotice {
  constructor(data?: Partial<ComplianceAndEnforcementNotice>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @AutoMap()
  @Column({ type: 'boolean', default: true })
  isDraft!: boolean;

  @AutoMap()
  @Column({ type: 'date', nullable: true })
  date!: string | null;

  @AutoMap()
  @Column({ type: 'enum', enum: NoticeType, nullable: true })
  type!: NoticeType | null;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: AllegedActivity,
    enumName: 'compliance_and_enforcement_alleged_activity_enum',
    array: true,
    default: [],
  })
  allegedActivity!: AllegedActivity[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  notifications!: NoticeNotification[];

  @ManyToOne(() => ComplianceAndEnforcementChronologyEntry, (entry) => entry.notices, { onDelete: 'CASCADE' })
  entry!: ComplianceAndEnforcementChronologyEntry;

  @OneToMany(() => ComplianceAndEnforcementNoticeDueDate, (dueDate) => dueDate.notice, { cascade: true })
  dueDates!: ComplianceAndEnforcementNoticeDueDate[];

  @OneToMany(() => ComplianceAndEnforcementDocument, (document) => document.notice)
  documents!: ComplianceAndEnforcementDocument[];

  @ManyToOne(() => ComplianceAndEnforcementResponsibleParty, { nullable: true, onDelete: 'SET NULL' })
  issuedToIndividualResponsibleParty!: ComplianceAndEnforcementResponsibleParty | null;

  @ManyToOne(() => ComplianceAndEnforcementResponsiblePartyDirector, { nullable: true, onDelete: 'SET NULL' })
  issuedToDirector!: ComplianceAndEnforcementResponsiblePartyDirector | null;
}
