import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity()
export class NaruSubtype extends BaseCodeEntity {
  constructor(data?: Partial<NaruSubtype>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
