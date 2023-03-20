import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Card } from '../card/card.entity';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { CommentMention } from './mention/comment-mention.entity';

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

  @AutoMap()
  @OneToMany(() => CommentMention, (mention) => mention.comment)
  mentions: CommentMention[];

  @Column()
  @Index()
  cardUuid: string;

  @ManyToOne(() => Card)
  card: Card;
}
