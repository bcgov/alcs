import { Entity } from 'typeorm';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

@Entity()
export class ApplicationDecisionMakerCodeDto extends BaseCodeDto {}
