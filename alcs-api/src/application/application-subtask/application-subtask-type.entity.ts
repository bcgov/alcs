import { AutoMap } from '@automapper/classes';
import { Column, Entity } from 'typeorm';
import { Base } from '../../common/entities/base.entity';

@Entity()
export class ApplicationSubtaskType extends Base {
  @AutoMap()
  @Column()
  type: string;

  @AutoMap()
  @Column()
  backgroundColor: string;

  @AutoMap()
  @Column()
  textColor: string;
}
