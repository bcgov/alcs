import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class Auditable extends BaseEntity {
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
