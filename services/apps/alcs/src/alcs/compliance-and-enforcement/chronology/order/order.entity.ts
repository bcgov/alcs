import { AutoMap } from 'automapper-classes';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AllegedActivity, OrderType } from '../../compliance-and-enforcement.enum';
import { ComplianceAndEnforcementDocument } from '../../document/document.entity';
import { ComplianceAndEnforcementResponsiblePartyDirector } from '../../responsible-parties/responsible-party-director.entity';
import { ComplianceAndEnforcementResponsibleParty } from '../../responsible-parties/responsible-party.entity';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology.entity';
import { ComplianceAndEnforcementOrderDueDate } from './due-date/due-date.entity';
import { OrderNotification } from './order.dto';

@Entity({
  comment: 'Compliance and enforcement chronology entry',
})
export class ComplianceAndEnforcementOrder {
  constructor(data?: Partial<ComplianceAndEnforcementOrder>) {
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
  @Column({ type: 'enum', enum: OrderType, nullable: true })
  type!: OrderType | null;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: AllegedActivity,
    enumName: 'compliance_and_enforcement_alleged_activity_enum',
    array: true,
    default: [],
  })
  allegedActivity!: AllegedActivity[];

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  amount!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  notifications!: OrderNotification[];

  @ManyToOne(() => ComplianceAndEnforcementChronologyEntry, (entry) => entry.orders, { onDelete: 'CASCADE' })
  entry!: ComplianceAndEnforcementChronologyEntry;

  @OneToMany(() => ComplianceAndEnforcementOrderDueDate, (dueDate) => dueDate.order, { cascade: true })
  dueDates!: ComplianceAndEnforcementOrderDueDate[];

  @OneToMany(() => ComplianceAndEnforcementDocument, (document) => document.order)
  documents!: ComplianceAndEnforcementDocument[];

  @ManyToOne(() => ComplianceAndEnforcementResponsibleParty, { nullable: true, onDelete: 'SET NULL' })
  issuedToIndividualResponsibleParty!: ComplianceAndEnforcementResponsibleParty | null;

  @ManyToOne(() => ComplianceAndEnforcementResponsiblePartyDirector, { nullable: true, onDelete: 'SET NULL' })
  issuedToDirector!: ComplianceAndEnforcementResponsiblePartyDirector | null;
}
