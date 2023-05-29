import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, Entity, Index, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';

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

  @Column()
  @Index()
  parentUuid: string;
}
