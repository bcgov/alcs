import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../../../common/entities/base.code.entity';

@Entity({
  comment: 'Code table for the possible application decision component types',
})
export class ApplicationDecisionComponentType extends BaseCodeEntity {
  constructor(data?: Partial<ApplicationDecisionComponentType>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
