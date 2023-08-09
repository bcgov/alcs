import { AutoMap } from '@automapper/classes';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { NoticeOfIntentSubmissionToSubmissionStatus } from './notice-of-intent-status.entity';

@Entity()
export class NoticeOfIntentSubmissionStatusType extends BaseCodeEntity {
  constructor(data?: Partial<NoticeOfIntentSubmissionStatusType>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => Number)
  @Column({ type: 'smallint', default: 0 })
  weight: number;

  @OneToMany(
    () => NoticeOfIntentSubmissionToSubmissionStatus,
    (s) => s.statusType,
  )
  public submissionStatuses: NoticeOfIntentSubmissionToSubmissionStatus[];

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
