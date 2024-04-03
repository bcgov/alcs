import { AutoMap } from 'automapper-classes';
import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({
  comment:
    'Code table for criteria under which the CEO can make a decision on an application',
})
export class ApplicationCeoCriterionCode extends BaseCodeEntity {
  @AutoMap()
  @Column({ unique: true })
  number: number;
}
