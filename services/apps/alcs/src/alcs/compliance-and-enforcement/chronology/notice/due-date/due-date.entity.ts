import { AutoMap } from 'automapper-classes';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ComplianceAndEnforcementNotice } from '../notice.entity';

@Entity({
  comment: 'Compliance and enforcement chronology notice due date',
})
export class ComplianceAndEnforcementNoticeDueDate {
  constructor(data?: Partial<ComplianceAndEnforcementNoticeDueDate>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @AutoMap()
  @Column({ type: 'date', nullable: false })
  date!: string;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  completedDate!: Date | null;

  @AutoMap()
  @Column({ type: 'text', nullable: false, default: '' })
  comment!: string;

  @ManyToOne(() => ComplianceAndEnforcementNotice, (notice) => notice.dueDates, { onDelete: 'CASCADE' })
  notice!: ComplianceAndEnforcementNotice;
}
