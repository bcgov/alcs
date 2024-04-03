import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../../common/entities/base.code.entity';

@Entity({ comment: 'Code table for possible types of reconsiderations' })
export class ApplicationReconsiderationType extends BaseCodeEntity {}
