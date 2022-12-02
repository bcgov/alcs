import { AutoMap } from '@automapper/classes';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from './audit.entity';

export abstract class Base extends Auditable {
  // this is a public column, this is safe to expose to consumers
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;
}
