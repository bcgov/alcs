import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';

export enum ResponsiblePartyType {
  PROPERTY_OWNER = 'Property Owner',
  LESSEE_TENANT = 'Lessee/Tenant',
  OPERATOR = 'Operator',
  CONTRACTOR = 'Contractor',
}

export enum FOIPPACategory {
  INDIVIDUAL = 'Individual',
  ORGANIZATION = 'Organization',
}

@Entity({
  comment: 'Compliance and enforcement responsible party',
})
export class ComplianceAndEnforcementResponsibleParty {
  constructor(data?: Partial<ComplianceAndEnforcementResponsibleParty>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryColumn('uuid')
  uuid: string;

  @AutoMap()
  @Column({ type: 'enum', enum: ResponsiblePartyType })
  partyType: ResponsiblePartyType;

  @AutoMap()
  @Column({ type: 'enum', enum: FOIPPACategory, default: FOIPPACategory.INDIVIDUAL })
  foippaCategory: FOIPPACategory;

  @AutoMap()
  @Column({ type: 'boolean', default: false })
  isPrevious: boolean;

  // Individual fields
  @AutoMap()
  @Column({ type: 'text', nullable: true })
  individualName?: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  individualMailingAddress?: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  individualTelephone?: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  individualEmail?: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  individualNote?: string;

  // Organization fields
  @AutoMap()
  @Column({ type: 'text', nullable: true })
  organizationName?: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  organizationTelephone?: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  organizationEmail?: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  organizationNote?: string;

  @AutoMap()
  @OneToMany('ComplianceAndEnforcementResponsiblePartyDirector', 'responsibleParty', { cascade: true })
  directors?: any[];

  // Property Owner specific
  @AutoMap()
  @Column({ type: 'timestamptz', nullable: true })
  ownerSince?: Date | null;

  @ManyToOne(() => ComplianceAndEnforcement, (file) => file.responsibleParties)
  file: ComplianceAndEnforcement;

  @AutoMap()
  @Column()
  fileUuid: string;
}