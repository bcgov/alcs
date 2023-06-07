import { AutoMap } from '@automapper/classes';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Auditable } from '../../../common/entities/audit.entity';
import { Document } from '../../../document/document.entity';
import { ApplicationDecision } from '../application-decision.entity';

@Entity()
export class ApplicationDecisionDocument extends Auditable {
  constructor(data?: Partial<ApplicationDecisionDocument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => ApplicationDecision, { nullable: false })
  decision: ApplicationDecision;

  @Column()
  decisionUuid: string;

  @OneToOne(() => Document, {
    cascade: true,
  })
  @JoinColumn()
  document: Document;
}
