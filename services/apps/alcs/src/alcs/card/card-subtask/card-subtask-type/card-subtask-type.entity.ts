import { AutoMap } from 'automapper-classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../../common/entities/base.code.entity';

@Entity({ comment: 'Code table for possible subtask types' })
export class CardSubtaskType extends BaseCodeEntity {
  @AutoMap()
  @Column()
  backgroundColor: string;

  @AutoMap()
  @Column()
  textColor: string;
}
