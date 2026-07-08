import { AutoMap } from 'automapper-classes';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ComplianceAndEnforcementOrder } from '../order.entity';

@Entity({
  comment: 'Compliance and enforcement chronology order due date',
})
export class ComplianceAndEnforcementOrderDueDate {
  constructor(data?: Partial<ComplianceAndEnforcementOrderDueDate>) {
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

  @ManyToOne(() => ComplianceAndEnforcementOrder, (order) => order.dueDates, { onDelete: 'CASCADE' })
  order!: ComplianceAndEnforcementOrder;
}
