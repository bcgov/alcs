import { Column, Entity } from 'typeorm';
import { Base } from '../common/entities/base.entity';

@Entity()
export class User extends Base {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  displayName: string;

  @Column()
  identityProvider: string;

  @Column()
  preferredUsername: string;

  @Column()
  givenName: string;

  @Column()
  familyName: string;

  @Column({ nullable: true })
  idirUserGuid: string;

  @Column({ nullable: true })
  idirUserName: string;
}
