import { AutoMap } from '@automapper/classes';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';

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
    comment: 'The Applicants name on the application',
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
}
