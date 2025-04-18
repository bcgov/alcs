import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { FILE_NUMBER_SEQUENCE } from '../../file-number/file-number.constants';
import { ApplicationSubmissionReview } from '../../portal/application-submission-review/application-submission-review.entity';
import { ColumnNumericTransformer } from '../../utils/column-numeric-transform';
import { ApplicationReconsideration } from '../application-decision/application-reconsideration/application-reconsideration.entity';
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { ApplicationDecisionMeeting } from './application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationMeeting } from './application-meeting/application-meeting.entity';
import { ApplicationPaused } from './application-paused.entity';
import { Tag } from '../tag/tag.entity';
// import { ApplicationTag } from './application-tag/application-tag.entity';

@Entity({
  comment: 'Base data for applications including the ID, key dates, and the date of the first decision',
})
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
    default: () => `NEXTVAL('${FILE_NUMBER_SEQUENCE}')`,
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

  @AutoMap(() => Boolean)
  @Column({
    type: 'boolean',
    default: false,
  })
  hideFromPortal?: boolean;

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

  @ManyToOne(() => LocalGovernment, { nullable: true })
  localGovernment?: LocalGovernment;

  @Index()
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
    precision: 15,
    scale: 5,
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
    comment: 'ALC Staff Observations and Comments',
    nullable: true,
  })
  staffObservations?: string | null;

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

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Inclusion Exclusion Applicant Type',
    nullable: true,
  })
  inclExclApplicantType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Application Id that is applicable only to paper version applications from 70s - 80s',
    nullable: true,
  })
  legacyId?: string | null;

  @AutoMap()
  @OneToMany(() => ApplicationPaused, (appPaused) => appPaused.application)
  pauses: ApplicationPaused[];

  @AutoMap()
  @OneToMany(() => ApplicationDecisionMeeting, (appDecMeeting) => appDecMeeting.application)
  decisionMeetings: ApplicationDecisionMeeting[];

  @AutoMap()
  @OneToMany(() => ApplicationMeeting, (appMeeting) => appMeeting.application)
  applicationMeetings: ApplicationMeeting[];

  @AutoMap()
  @OneToMany(() => ApplicationDocument, (appDocument) => appDocument.application)
  documents: ApplicationDocument[];

  @AutoMap()
  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card | null;

  @AutoMap()
  @Index()
  @Column({
    type: 'uuid',
    nullable: true,
  })
  cardUuid: string;

  @AutoMap()
  @OneToMany(() => ApplicationReconsideration, (appRecon) => appRecon.application)
  reconsiderations: ApplicationReconsideration[];

  @AutoMap(() => ApplicationSubmissionReview)
  @OneToOne(() => ApplicationSubmissionReview, (appReview) => appReview.application)
  submittedApplicationReview?: ApplicationSubmissionReview;

  @AutoMap(() => [Tag])
  @ManyToMany(() => Tag, (tag) => tag.applications)
  @JoinTable({ name: 'application_tag' })
  tags: Tag[];
}
