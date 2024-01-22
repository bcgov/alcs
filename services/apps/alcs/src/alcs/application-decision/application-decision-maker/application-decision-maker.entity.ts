import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity()
export class ApplicationDecisionMakerCode extends BaseCodeEntity {
  @Column({ default: true })
  isActive: boolean;
}
