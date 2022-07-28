import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../common/entities/base.code.entity';

@Entity()
export class ApplicationType extends BaseCodeEntity {
  @Column()
  label: string;

  @Column()
  shortLabel: string;
}
