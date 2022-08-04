import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, Entity, Index, ManyToOne } from 'typeorm';
import { Application } from '../application/application.entity';
import { Base } from '../common/entities/base.entity';
import { User } from '../user/user.entity';

@Entity()
export class Comment extends Base {
  constructor(data?: Partial<Comment>) {
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
  application: Application;

  @Column()
  @Index()
  applicationUuid: string;
}
