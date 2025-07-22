import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';

@Entity({
  comment: 'Compliance and enforcement property',
})
export class ComplianceAndEnforcementProperty {
  constructor(data?: Partial<ComplianceAndEnforcementProperty>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap()
  @Column({ type: 'text' })
  civicAddress: string;

  @AutoMap()
  @Column({ type: 'text' })
  legalDescription: string;

  @AutoMap()
  @Column({ type: 'text' })
  localGovernmentUuid: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  regionCode: string | null;

  @AutoMap()
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @AutoMap()
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @AutoMap()
  @Column({ type: 'text' })
  ownershipTypeCode: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  pid: string | null;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  pin: string | null;

  @AutoMap()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  areaHectares: number;

  @AutoMap()
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  alrPercentage: number;

  @AutoMap()
  @Column({ type: 'text' })
  alcHistory: string;

  @ManyToOne(() => ComplianceAndEnforcement, (file) => file.properties)
  file: ComplianceAndEnforcement;

  @AutoMap()
  @Column()
  fileUuid: string;
} 