import { AutoMap } from '@automapper/classes';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Card } from '../alcs/card/card.entity';
import { CommentMention } from '../alcs/comment/mention/comment-mention.entity';
import { Base } from '../common/entities/base.entity';
import { Document } from '../document/document.entity';

export class UserSettings {
  favoriteBoards: string[];
}

@Entity()
export class User extends Base {
  @AutoMap()
  @Column()
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
  @Index({ unique: true })
  @Column({ nullable: true })
  idirUserGuid: string;

  @AutoMap()
  @Column({ nullable: true })
  idirUserName: string;

  @AutoMap()
  @Index({ unique: true })
  @Column({ nullable: true })
  bceidGuid: string;

  @AutoMap()
  @Column({ nullable: true })
  bceidUserName: string;

  @Column({ nullable: true })
  bceidBusinessGuid: string;

  @AutoMap()
  @Column({ default: [], array: true, type: 'text' })
  clientRoles: string[];

  @AutoMap()
  @Column({ type: 'jsonb', nullable: true })
  settings: UserSettings;

  @AutoMap()
  @OneToMany(() => CommentMention, (mention) => mention.user)
  mentions: CommentMention[];

  @AutoMap()
  @OneToMany(() => Document, (document) => document.uploadedBy)
  documents: Document[];

  @AutoMap()
  @OneToMany(() => Card, (app) => app.assignee)
  cards: Card[];
}
