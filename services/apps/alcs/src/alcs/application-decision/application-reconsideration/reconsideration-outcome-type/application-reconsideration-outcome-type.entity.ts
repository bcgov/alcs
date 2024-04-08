import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../../common/entities/base.code.entity';

@Entity({
  comment:
    'Code table for possible application reconsideration review outcomes',
})
export class ApplicationReconsiderationOutcomeType extends BaseCodeEntity {}
