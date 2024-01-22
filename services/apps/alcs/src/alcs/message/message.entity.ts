import { AutoMap } from 'automapper-classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';

@Entity()
export class Message {
  constructor(data?: Partial<Message>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

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
  targetType: string;

  @AutoMap()
  @Column()
  link: string;
}
