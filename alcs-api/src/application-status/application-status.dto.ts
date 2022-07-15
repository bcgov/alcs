import { BaseCodeDto } from '../common/dtos/base.dto';
import { Entity } from 'typeorm';

@Entity()
export class ApplicationStatusDto extends BaseCodeDto {}
