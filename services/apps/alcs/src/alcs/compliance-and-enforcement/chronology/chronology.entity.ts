import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from '../../../common/entities/audit.entity';
import { User } from '../../../user/user.entity';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';
import { ComplianceAndEnforcementDocument } from '../document/document.entity';
import { ComplianceAndEnforcementChronologyInspection } from './inspection/inspection.entity';
import { ComplianceAndEnforcementNotice } from './notice/notice.entity';
import { ComplianceAndEnforcementOrder } from './order/order.entity';

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

  @ManyToOne(() => User, { nullable: false })
  author: User;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  description: string;

  @ManyToOne(() => ComplianceAndEnforcement, (file) => file.chronologyEntries)
  file: ComplianceAndEnforcement;

  @OneToMany(() => ComplianceAndEnforcementDocument, (document) => document.chronologyEntry)
  documents: ComplianceAndEnforcementDocument[];

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  nrisInspectionId: string | null;

  @OneToMany(() => ComplianceAndEnforcementChronologyInspection, (inspection) => inspection.entry, {
    onDelete: 'CASCADE',
  })
  inspections: ComplianceAndEnforcementChronologyInspection[];

  @OneToMany(() => ComplianceAndEnforcementNotice, (notice) => notice.entry, {
    onDelete: 'CASCADE',
  })
  notices: ComplianceAndEnforcementNotice[];

  @OneToMany(() => ComplianceAndEnforcementOrder, (order) => order.entry, {
    onDelete: 'CASCADE',
  })
  orders: ComplianceAndEnforcementOrder[];
}
