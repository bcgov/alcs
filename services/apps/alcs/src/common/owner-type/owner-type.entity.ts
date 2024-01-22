import { Entity } from 'typeorm';
import { BaseCodeDto } from '../dtos/base.dto';
import { BaseCodeEntity } from '../entities/base.code.entity';

export enum OWNER_TYPE {
  INDIVIDUAL = 'INDV',
  ORGANIZATION = 'ORGZ',
  AGENT = 'AGEN',
  CROWN = 'CRWN',
  GOVERNMENT = 'GOVR',
}

export class OwnerTypeDto extends BaseCodeDto {}

@Entity()
export class OwnerType extends BaseCodeEntity {
  constructor(data?: Partial<OwnerType>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
