import { AutoMap } from '@automapper/classes';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';
import { ApplicationSubmissionToSubmissionStatus } from './submission-status.entity';

@Entity()
export class ApplicationSubmissionStatusType extends BaseCodeEntity {
  constructor(data?: Partial<ApplicationSubmissionStatusType>) {
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
