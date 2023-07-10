import { AutoMap } from '@automapper/classes';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { ApplicationSubmissionToSubmissionStatus } from './submission-status.entity';

@Entity()
export class SubmissionStatusType extends BaseCodeEntity {
  constructor(data?: Partial<SubmissionStatusType>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => Number)
  @Column({ type: 'smallint', default: 0 })
  weight: number;

  @OneToMany(() => ApplicationSubmissionToSubmissionStatus, (s) => s.statusType)
  public submissionStatuses: ApplicationSubmissionToSubmissionStatus[];
}
