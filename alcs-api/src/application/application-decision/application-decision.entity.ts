import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { ApplicationDocument } from '../application-document/application-document.entity';
import { Application } from '../application.entity';
import { DecisionDocument } from './decision-document.entity';

@Entity()
export class ApplicationDecision extends Base {
  constructor(data?: Partial<ApplicationDecision>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'timestamptz' })
  date: Date;

  @AutoMap()
  @Column()
  outcome: string;

  @AutoMap()
  @ManyToOne(() => Application)
  application: Application;

  @AutoMap()
  @Column()
  applicationUuid: string;

  @AutoMap()
  @OneToMany(() => DecisionDocument, (document) => document.decision, {
    cascade: ['remove'],
  })
  documents: DecisionDocument[];
}
