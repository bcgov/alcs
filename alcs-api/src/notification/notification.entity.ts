import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Notification {
  constructor(data?: Partial<Notification>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @AutoMap()
  @ManyToOne(() => User)
  actor: User;

  @AutoMap()
  @ManyToOne(() => User)
  receiver: User;

  @Column()
  receiverUuid: string;

  @AutoMap()
  @Column()
  title: string;

  @AutoMap()
  @Column()
  body: string;

  @AutoMap()
  @Column({ default: false })
  read: boolean;

  @AutoMap()
  @Column()
  targetType: 'application';

  @AutoMap()
  @Column()
  link: string;
}
