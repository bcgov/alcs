import { AutoMap } from 'automapper-classes';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';
import { ComplianceAndEnforcementDocumentDto } from '../document/document.dto';
import { ComplianceAndEnforcementDocument } from '../document/document.entity';

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
  @Column({ type: 'text', default: '' })
  civicAddress: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  legalDescription: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  localGovernmentUuid: string;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  regionCode: string;

  @AutoMap()
  @Column({ type: 'decimal', precision: 10, scale: 7, default: 0 })
  latitude: number;

  @AutoMap()
  @Column({ type: 'decimal', precision: 10, scale: 7, default: 0 })
  longitude: number;

  @AutoMap()
  @Column({ type: 'text', default: 'SMPL' })
  ownershipTypeCode: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  pid: string | null;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  pin: string | null;

  @AutoMap()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  areaHectares: number;

  @AutoMap()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  alrPercentage: number;

  @AutoMap()
  @Column({ type: 'text', default: '' })
  alcHistory: string;

  @ManyToOne(() => ComplianceAndEnforcement, (file) => file.properties)
  file: ComplianceAndEnforcement;

  @AutoMap()
  @Column()
  fileUuid: string;

  @AutoMap()
  @JoinColumn()
  @OneToOne(() => ComplianceAndEnforcementDocument, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  certificateOfTitle?: ComplianceAndEnforcementDocument;
}
