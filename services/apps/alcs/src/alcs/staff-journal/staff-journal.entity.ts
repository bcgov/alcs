import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, Entity, Index, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { Application } from '../application/application.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';

@Entity()
export class StaffJournal extends Base {
  constructor(data?: Partial<StaffJournal>) {
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

  @ManyToOne(() => Application)
  application: Application | null;
  @Column({ nullable: true })
  @Index()
  applicationUuid: string;

  @ManyToOne(() => NoticeOfIntent)
  noticeOfIntent: NoticeOfIntent | null;

  @Column({ nullable: true })
  @Index()
  noticeOfIntentUuid: string;
}
