import { AutoMap } from '@automapper/classes';
import { Column, Entity, OneToMany } from 'typeorm';
import { Application } from '../application/application.entity';
import { CommentMention } from '../comment/mention/comment-mention.entity';
import { Base } from '../common/entities/base.entity';
import { Document } from '../document/document.entity';

export class UserSettings {
  favoriteBoards: string[];
}

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
  @Column({ type: 'jsonb', nullable: true })
  settings: UserSettings;

  @AutoMap()
  @OneToMany(() => CommentMention, (mention) => mention.user)
  mentions: CommentMention[];

  @AutoMap()
  @OneToMany(() => Document, (document) => document.uploadedBy)
  documents: Document[];

  @AutoMap()
  @OneToMany(() => Application, (app) => app.assignee)
  applications: Application[];
}
