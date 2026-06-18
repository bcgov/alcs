import { AutoMap } from 'automapper-classes';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../../user/user.entity';
import { AllegedActivity, InspectionType } from '../../compliance-and-enforcement.enum';
import { ComplianceAndEnforcementDocument } from '../../document/document.entity';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology.entity';
import { AttendeeDto } from './inspection.dto';

@Entity({
  comment: 'Compliance and enforcement chronology entry',
})
export class ComplianceAndEnforcementChronologyInspection {
  constructor(data?: Partial<ComplianceAndEnforcementChronologyInspection>) {
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
  @Column({ type: 'enum', enum: InspectionType, nullable: true })
  type!: InspectionType | null;

  @AutoMap()
  @ManyToOne(() => User, { nullable: false })
  officer!: User;

  @AutoMap()
  @Column({ type: 'enum', enum: AllegedActivity, array: true, default: [] })
  allegedActivity!: AllegedActivity[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  attendees!: AttendeeDto[];

  @AutoMap()
  @Column({ type: 'text', default: '' })
  comments!: string;

  @ManyToOne(() => ComplianceAndEnforcementChronologyEntry, (entry) => entry.inspections, { onDelete: 'CASCADE' })
  entry!: ComplianceAndEnforcementChronologyEntry;

  @OneToMany(() => ComplianceAndEnforcementDocument, (document) => document.inspection)
  documents!: ComplianceAndEnforcementDocument[];
}
