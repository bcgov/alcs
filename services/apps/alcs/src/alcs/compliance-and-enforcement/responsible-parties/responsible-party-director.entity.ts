import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ComplianceAndEnforcementResponsibleParty } from './responsible-party.entity';

@Entity({
  comment: 'Compliance and enforcement responsible party director',
})
export class ComplianceAndEnforcementResponsiblePartyDirector {
  constructor(data?: Partial<ComplianceAndEnforcementResponsiblePartyDirector>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap()
  @Column({ type: 'text' })
  directorName: string;

  @AutoMap()
  @Column({ type: 'text' })
  directorMailingAddress: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  directorTelephone?: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  directorEmail?: string;

  @ManyToOne(() => ComplianceAndEnforcementResponsibleParty, (party) => party.directors)
  responsibleParty: ComplianceAndEnforcementResponsibleParty;
}