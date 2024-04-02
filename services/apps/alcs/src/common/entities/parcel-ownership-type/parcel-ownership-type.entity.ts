import { Entity } from 'typeorm';
import { BaseCodeDto } from '../../dtos/base.dto';
import { BaseCodeEntity } from '../base.code.entity';

export class ParcelOwnershipTypeDto extends BaseCodeDto {}

@Entity({
  comment: 'Code table for possible land ownership types (Fee simple vs Crown)',
})
export class ParcelOwnershipType extends BaseCodeEntity {}
