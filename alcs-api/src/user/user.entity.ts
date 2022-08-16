import { AutoMap } from '@automapper/classes';
import { Column, Entity, OneToMany } from 'typeorm';
import { CommentMention } from '../comment/mention/comment-mention.entity';
import { Base } from '../common/entities/base.entity';

@Entity()
export class User extends Base {
  @AutoMap()
  @Column({ unique: true })
  email: string;
  @AutoMap()
  @Column()
  displayName: string;

  @AutoMap()
  @Column()
  identityProvider: string;

  @AutoMap()
  @Column()
  preferredUsername: string;

  @AutoMap()
  @Column({ nullable: true })
  name?: string;

  @AutoMap()
  @Column({ nullable: true })
  givenName?: string;

  @AutoMap()
  @Column({ nullable: true })
  familyName: string;

  @AutoMap()
  @Column({ nullable: true })
  idirUserGuid: string;

  @AutoMap()
  @Column({ nullable: true })
  idirUserName: string;

  @AutoMap()
  @Column({ nullable: true })
  bceidGuid: string;

  @AutoMap()
  @Column({ nullable: true })
  bceidUserName: string;

  @AutoMap()
  @OneToMany(() => CommentMention, (mention) => mention.user)
  mentions: CommentMention[];
}
