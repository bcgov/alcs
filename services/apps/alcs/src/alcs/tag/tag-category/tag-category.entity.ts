import { AutoMap } from 'automapper-classes';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';

@Entity({ comment: 'Tag category.' })
export class TagCategory extends Base {
  constructor(data?: Partial<TagCategory>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap()
  @Column()
  name: string;
}
