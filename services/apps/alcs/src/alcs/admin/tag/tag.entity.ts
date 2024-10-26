import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { TagCategory } from '../tag-category/tag-category.entity';

@Entity({ comment: 'Tag.' })
export class Tag extends Base {
  constructor(data?: Partial<Tag>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap()
  @Column({ unique: true })
  name: string;

  @AutoMap()
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => TagCategory)
  category: TagCategory;
}
