import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../../common/entities/base.code.entity';

@Entity({
  comment: 'Code table for possible application modification review outcomes',
})
export class ApplicationModificationOutcomeType extends BaseCodeEntity {}
