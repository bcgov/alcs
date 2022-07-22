import { BaseCodeEntity } from '../../common/entities/base.code.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class ApplicationStatus extends BaseCodeEntity {
  @Column({ nullable: false })
  label: string;
}
