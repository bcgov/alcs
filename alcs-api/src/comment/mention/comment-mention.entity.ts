import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { Comment } from '../comment.entity';

@Entity()
export class CommentMention extends Base {
  @AutoMap()
  @Column()
  commentUuid: string;

  @AutoMap()
  @Column()
  userUuid: string;

  // TODO: rename all mentionName to mentionLabel
  @AutoMap()
  @Column()
  mentionName: string;

  @AutoMap()
  @ManyToOne(() => Comment, (comment) => comment.mentions)
  comment: Comment;

  @AutoMap()
  @ManyToOne(() => User, (user) => user.mentions)
  user: User;
}
