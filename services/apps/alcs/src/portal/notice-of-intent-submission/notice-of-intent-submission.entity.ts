import { AutoMap } from '@automapper/classes';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { NoticeOfIntentOwner } from './notice-of-intent-owner/notice-of-intent-owner.entity';

@Entity()
export class NoticeOfIntentSubmission extends Base {
  constructor(data?: Partial<NoticeOfIntentSubmission>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap({})
  @Column({
    comment: 'File Number of attached application',
  })
  fileNumber: string;

  @AutoMap({})
  @Column({
    comment: 'Indicates whether submission is currently draft or not',
    default: false,
  })
  isDraft: boolean;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    comment: 'The Applicants name on the application',
    nullable: true,
  })
  applicant?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'uuid',
    comment: 'UUID from ALCS System of the Local Government',
    nullable: true,
  })
  localGovernmentUuid?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    comment: 'The purpose of the application',
    nullable: true,
  })
  purpose?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Quantify and describe in detail all agriculture that currently takes place on the parcel(s).',
    nullable: true,
  })
  parcelsAgricultureDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Quantify and describe in detail all agricultural improvements made to the parcel(s).',
    nullable: true,
  })
  parcelsAgricultureImprovementDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Quantify and describe all non-agricultural uses that currently take place on the parcel(s).',
    nullable: true,
  })
  parcelsNonAgricultureUseDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'The land uses surrounding the parcel(s) under application on the North.',
    nullable: true,
  })
  northLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Description of the land uses surrounding the parcel(s) under application on the North.',
    nullable: true,
  })
  northLandUseTypeDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'The land uses surrounding the parcel(s) under application on the East.',
    nullable: true,
  })
  eastLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Description of the land uses surrounding the parcel(s) under application on the East.',
    nullable: true,
  })
  eastLandUseTypeDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'The land uses surrounding the parcel(s) under application on the South.',
    nullable: true,
  })
  southLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Description of the land uses surrounding the parcel(s) under application on the South.',
    nullable: true,
  })
  southLandUseTypeDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'The land uses surrounding the parcel(s) under application on the West.',
    nullable: true,
  })
  westLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Description of the land uses surrounding the parcel(s) under application on the West.',
    nullable: true,
  })
  westLandUseTypeDescription?: string | null;

  @AutoMap()
  @ManyToOne(() => User)
  createdBy: User;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Stores Uuid of Owner Selected as Primary Contact',
  })
  primaryContactOwnerUuid?: string | null;

  @AutoMap()
  @Column({
    comment: 'Notice of Intent Type Code',
  })
  typeCode: string;

  @AutoMap(() => NoticeOfIntent)
  @ManyToOne(() => NoticeOfIntent)
  @JoinColumn({
    name: 'file_number',
    referencedColumnName: 'fileNumber',
  })
  noticeOfIntent: NoticeOfIntent;

  @OneToMany(
    () => NoticeOfIntentOwner,
    (owner) => owner.noticeOfIntentSubmission,
  )
  owners: NoticeOfIntentOwner[];

  @OneToMany(
    () => NoticeOfIntentSubmissionToSubmissionStatus,
    (status) => status.submission,
    {
      eager: true,
      persistence: false,
    },
  )
  submissionStatuses: NoticeOfIntentSubmissionToSubmissionStatus[] = [];

  private _status: NoticeOfIntentSubmissionToSubmissionStatus;

  get status(): NoticeOfIntentSubmissionToSubmissionStatus {
    return this._status;
  }

  private set status(value: NoticeOfIntentSubmissionToSubmissionStatus) {
    this._status = value;
  }

  @AfterLoad()
  populateCurrentStatus() {
    // using JS date object is intentional for performance reasons
    const now = Date.now();

    for (const status of this.submissionStatuses) {
      const effectiveDate = status.effectiveDate?.getTime();
      const currentEffectiveDate = this.status?.effectiveDate?.getTime();

      if (
        effectiveDate &&
        effectiveDate <= now &&
        (!currentEffectiveDate ||
          effectiveDate > currentEffectiveDate ||
          (effectiveDate === currentEffectiveDate &&
            status.statusType.weight > this.status.statusType.weight))
      ) {
        this.status = status;
      }
    }
  }
}
