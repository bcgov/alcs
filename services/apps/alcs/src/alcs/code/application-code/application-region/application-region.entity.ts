import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../../common/entities/base.code.entity';

@Entity({
  comment: 'Code table for possible administrative regions in the province',
})
export class ApplicationRegion extends BaseCodeEntity {}
