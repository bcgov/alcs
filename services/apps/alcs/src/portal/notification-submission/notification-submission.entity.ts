import { AutoMap } from '@automapper/classes';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Notification } from '../../alcs/notification/notification.entity';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { NotificationParcel } from './notification-parcel/notification-parcel.entity';
import { NotificationTransferee } from './notification-transferee/notification-transferee.entity';

@Entity()
export class NotificationSubmission extends Base {
  constructor(data?: Partial<NotificationSubmission>) {
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
    comment: 'File Number of attached SRW',
  })
  fileNumber: string;

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
    comment: 'UUID of the Local Government',
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

  @AutoMap()
  @ManyToOne(() => User)
  createdBy: User;

  @AutoMap()
  @Column({
    comment: 'SRW Type Code',
  })
  typeCode: string;

  @AutoMap(() => Notification)
  @ManyToOne(() => Notification)
  @JoinColumn({
    name: 'file_number',
    referencedColumnName: 'fileNumber',
  })
  notification: Notification;

  @OneToMany(
    () => NotificationTransferee,
    (transferee) => transferee.notificationSubmission,
  )
  transferees: NotificationTransferee[];

  @OneToMany(
    () => NotificationParcel,
    (parcel) => parcel.notificationSubmission,
  )
  parcels: NotificationParcel[];
}
