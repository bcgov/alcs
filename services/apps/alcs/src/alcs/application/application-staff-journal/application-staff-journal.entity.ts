import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, Entity, Index, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { User } from '../../../user/user.entity';
import { Application } from '../application.entity';

@Entity()
export class ApplicationStaffJournal extends Base {
  constructor(data?: Partial<ApplicationStaffJournal>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column()
  body: string;

  @Column({ default: false })
  edited: boolean;

  @AutoMap()
  @ManyToOne(() => User)
  author: User;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  @Index()
  applicationUuid: string;

  @ManyToOne(() => Application)
  application: Application;
}
