import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({
  comment:
    'Code table for possible subtypes of Non-Adhering Residential Use applications',
})
export class NaruSubtype extends BaseCodeEntity {
  constructor(data?: Partial<NaruSubtype>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
