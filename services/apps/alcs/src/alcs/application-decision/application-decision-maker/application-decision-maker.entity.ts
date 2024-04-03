import { Column, Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({ comment: 'Code table for the possible application decision makers' })
export class ApplicationDecisionMakerCode extends BaseCodeEntity {
  @Column({ default: true })
  isActive: boolean;
}
