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
import { Base } from '../../common/entities/base.entity';
import { ApplicationSubmissionReview } from '../../portal/application-submission-review/application-submission-review.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { ColumnNumericTransformer } from '../../utils/column-numeric-transform';
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { ApplicationDecisionMeeting } from '../decision/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationReconsideration } from '../decision/application-reconsideration/application-reconsideration.entity';
import { ApplicationLocalGovernment } from './application-code/application-local-government/application-local-government.entity';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationMeeting } from './application-meeting/application-meeting.entity';
import { ApplicationPaused } from './application-paused.entity';

export class StatusHistory {
  type: 'status_change';
  label: string;
  description: string;
  time: number;
}

export const APPLICATION_FILE_NUMBER_SEQUENCE = 'alcs.alcs_file_number_seq';

@Entity()
export class Application extends Base {
  constructor(data?: Partial<Application>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({
    unique: true,
    default: () => `NEXTVAL('${APPLICATION_FILE_NUMBER_SEQUENCE}')`,
  })
  fileNumber: string;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @AutoMap()
  @Column()
  applicant: string;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateSubmittedToAlc?: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  feePaidDate?: Date | null;

  @AutoMap(() => Boolean)
  @Column({
    type: 'boolean',
    nullable: true,
  })
  feeWaived?: boolean | null;

  @AutoMap(() => Boolean)
  @Column({
    type: 'boolean',
    nullable: true,
  })
  feeSplitWithLg?: boolean | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  feeAmount?: number | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateAcknowledgedIncomplete?: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateReceivedAllItems?: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateAcknowledgedComplete?: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  decisionDate?: Date | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  notificationSentDate?: Date | null;

  @ManyToOne(() => ApplicationType, {
    nullable: false,
  })
  type: ApplicationType;

  @Column()
  typeCode: string;

  @ManyToOne(() => ApplicationRegion, { nullable: true })
  region?: ApplicationRegion;

  @Column({ nullable: true })
  regionCode?: string;

  @ManyToOne(() => ApplicationLocalGovernment, { nullable: true })
  localGovernment?: ApplicationLocalGovernment;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  localGovernmentUuid?: string;

  @AutoMap()
  @Column({
    default: 'ALCS',
    type: 'text',
    comment: 'Determines where the application came from',
  })
  source: 'ALCS' | 'APPLICANT';

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    comment: 'Area in hectares of ALR impacted by the proposal',
  })
  alrArea?: number | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Agricultural cap classification',
    nullable: true,
  })
  agCap?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Agricultural capability classification system used',
    nullable: true,
  })
  agCapSource?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Agricultural capability map sheet reference',
    nullable: true,
  })
  agCapMap?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Consultant who determined the agricultural capability',
    nullable: true,
  })
  agCapConsultant?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Non-farm use type',
    nullable: true,
  })
  nfuUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Non-farm use sub type',
    nullable: true,
  })
  nfuUseSubType?: string | null;

  @Column({
    type: 'timestamptz',
    comment: 'The date at which the non-farm use ends',
    nullable: true,
  })
  nfuEndDate?: Date | null;

  @AutoMap(() => [StatusHistory])
  @Column({
    comment:
      'JSONB Column containing the status history of the Application from the Portal',
    type: 'jsonb',
    array: false,
    default: () => `'[]'`,
  })
  statusHistory: StatusHistory[];

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
  card: Card | null;

  @AutoMap()
  @Column({
    type: 'uuid',
    nullable: true,
  })
  cardUuid: string;

  @AutoMap()
  @OneToMany(
    () => ApplicationReconsideration,
    (appRecon) => appRecon.application,
  )
  reconsiderations: ApplicationReconsideration[];

  @AutoMap(() => ApplicationSubmission)
  @OneToOne(() => ApplicationSubmission, (appSub) => appSub.application)
  submittedApplication?: ApplicationSubmission;

  @AutoMap(() => ApplicationSubmissionReview)
  @OneToOne(
    () => ApplicationSubmissionReview,
    (appReview) => appReview.application,
  )
  submittedApplicationReview?: ApplicationSubmissionReview;
}
