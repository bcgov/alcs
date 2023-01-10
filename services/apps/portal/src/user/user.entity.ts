import { AutoMap } from '@automapper/classes';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Document } from '../document/document.entity';
import { Base } from '../common/entities/base.entity';

@Entity()
export class User extends Base {
  constructor(data?: Partial<User>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

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
  @Index({ unique: true })
  @Column({ nullable: true })
  bceidGuid: string;

  @AutoMap()
  @Column({ nullable: true })
  bceidBusinessGuid: string;

  @AutoMap()
  @Column({ nullable: true })
  bceidUserName: string;

  @AutoMap()
  @Column({ default: [], array: true, type: 'text' })
  clientRoles: string[];
}
