import { Entity } from 'typeorm';
import { BaseCodeDto } from '../../dtos/base.dto';
import { BaseCodeEntity } from '../base.code.entity';

export class ParcelOwnershipTypeDto extends BaseCodeDto {}

@Entity()
export class ParcelOwnershipType extends BaseCodeEntity {}
