import { AutoMap } from '@automapper/classes';
import { Column, Entity } from 'typeorm';
import { Base } from '../common/entities/base.entity';

@Entity()
export class User extends Base {
  @AutoMap()
  @Column({ unique: true })
  email: string;

  @AutoMap()
  @Column()
  name: string;

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
  @Column()
  givenName: string;

  @AutoMap()
  @Column()
  familyName: string;

  @AutoMap()
  @Column({ nullable: true })
  idirUserGuid: string;

  @AutoMap()
  @Column({ nullable: true })
  idirUserName: string;
}
