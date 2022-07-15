import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  DeleteDateColumn,
} from 'typeorm';

export abstract class Base extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  auditDeletedDateAt: Date;

  @Column({ type: 'bigint', nullable: false, readonly: true })
  auditCreatedAt: number;

  @Column({ type: 'bigint', nullable: true, readonly: true })
  auditUpdatedAt: number;

  @BeforeUpdate()
  public setUpdatedAt() {
    this.auditUpdatedAt = Date.now();
  }

  @BeforeInsert()
  public setCreatedAt() {
    this.auditCreatedAt = Date.now();
  }
}
