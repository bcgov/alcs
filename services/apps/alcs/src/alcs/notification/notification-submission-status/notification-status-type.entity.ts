import { AutoMap } from 'automapper-classes';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { NotificationSubmissionToSubmissionStatus } from './notification-status.entity';

@Entity()
export class NotificationSubmissionStatusType extends BaseCodeEntity {
  constructor(data?: Partial<NotificationSubmissionStatusType>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => Number)
  @Column({ type: 'smallint', default: 0 })
  weight: number;

  @OneToMany(
    () => NotificationSubmissionToSubmissionStatus,
    (s) => s.statusType,
  )
  public submissionStatuses: NotificationSubmissionToSubmissionStatus[];

  @AutoMap()
  @Column()
  alcsBackgroundColor: string;

  @AutoMap()
  @Column()
  alcsColor: string;

  @AutoMap()
  @Column()
  portalBackgroundColor: string;

  @AutoMap()
  @Column()
  portalColor: string;
}
