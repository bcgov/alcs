import { Column, Entity } from 'typeorm';
import { Base } from '../common/entities/base.entity';
import { AUTH_ROLE } from '../common/enum';

@Entity()
export class User extends Base {
  @Column({ unique: true })
  email: string;

  @Column({ type: 'text', array: true })
  roles: AUTH_ROLE[];
}
