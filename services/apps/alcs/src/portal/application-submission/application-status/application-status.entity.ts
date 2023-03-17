import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity()
export class ApplicationStatus extends BaseCodeEntity {
  constructor(data?: Partial<ApplicationStatus>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
