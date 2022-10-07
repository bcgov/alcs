import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { Base } from '../common/entities/base.entity';
import { ApplicationLocalGovernment } from './application-code/application-local-government/application-local-government.entity';
import { ApplicationDecisionMeeting } from './application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationMeeting } from './application-meeting/application-meeting.entity';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationReconsideration } from './application-reconsideration/application-reconsideration.entity';

@Entity()
export class Application extends Base {
  @AutoMap()
  @Column({ unique: true })
  fileNumber: string;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @AutoMap()
  @Column()
  applicant: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
  })
  dateReceived: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  datePaid?: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateAcknowledgedIncomplete?: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateReceivedAllItems?: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateAcknowledgedComplete?: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  decisionDate?: Date;

  @ManyToOne(() => ApplicationType, {
    nullable: false,
  })
  type: ApplicationType;

  @Column({
    type: 'uuid',
  })
  typeUuid: string;

  @ManyToOne(() => ApplicationRegion)
  region: ApplicationRegion;

  @Column({
    type: 'uuid',
  })
  regionUuid: string;

  @ManyToOne(() => ApplicationLocalGovernment)
  localGovernment: ApplicationLocalGovernment;

  @Column({
    type: 'uuid',
  })
  localGovernmentUuid: string;

  @AutoMap()
  @OneToMany(() => ApplicationPaused, (appPaused) => appPaused.application)
  pauses: ApplicationPaused[];

  @AutoMap()
  @OneToMany(
    () => ApplicationDecisionMeeting,
    (appDecMeeting) => appDecMeeting.application,
  )
  decisionMeetings: ApplicationDecisionMeeting[];

  @AutoMap()
  @OneToMany(() => ApplicationMeeting, (appMeeting) => appMeeting.application)
  applicationMeetings: ApplicationMeeting[];

  @AutoMap()
  @OneToMany(
    () => ApplicationDocument,
    (appDocument) => appDocument.application,
  )
  documents: ApplicationDocument[];

  @AutoMap()
  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card;

  @AutoMap()
  @Column({
    type: 'uuid',
  })
  cardUuid: string;

  @AutoMap()
  @OneToMany(
    () => ApplicationReconsideration,
    (appRecon) => appRecon.application,
  )
  reconsiderations: ApplicationReconsideration[];
}
