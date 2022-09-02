import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class Base extends BaseEntity {
  // this is a public column, this is safe to expose to consumers
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  auditDeletedDateAt?: Date;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    update: false,
  })
  auditCreatedAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: true,
    update: false,
  })
  auditUpdatedAt?: Date;

  @Column({ nullable: false })
  auditCreatedBy: string;

  @Column({ nullable: true })
  auditUpdatedBy?: string;
}
