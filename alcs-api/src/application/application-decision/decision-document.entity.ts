import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from '../../document/document.entity';
import { ApplicationDecision } from './application-decision.entity';

@Entity()
export class DecisionDocument extends BaseEntity {
  constructor(data?: Partial<DecisionDocument>) {
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

  @OneToOne(() => Document)
  @JoinColumn()
  document: Document;
}
