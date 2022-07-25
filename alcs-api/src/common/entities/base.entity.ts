import {
  BaseEntity,
  DeleteDateColumn,
  CreateDateColumn,
  ColumnOptions,
  UpdateDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const getTimestampColumnsOptions = (): ColumnOptions => {
  return {
    type: 'timestamptz',
    transformer: {
      from: (value?: Date | null) =>
        value === undefined || value === null ? value : value.getTime(),
      to: (value?: number | null) =>
        value === undefined || value === null ? value : new Date(value),
    },
  };
};

export abstract class Base extends BaseEntity {
  // TODO: this will be discussed
  // // this is a private column, this should never be returned to api consumer
  // @Column({ unique: true, generated: true })
  // id: number;

  // this is a public column, this is safe to expose to consumers
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @DeleteDateColumn({
    ...getTimestampColumnsOptions(),
    nullable: true,
  })
  auditDeletedDateAt?: number;

  @CreateDateColumn({
    ...getTimestampColumnsOptions(),
    nullable: false,
    update: false,
  })
  auditCreatedAt: number;

  @UpdateDateColumn({
    ...getTimestampColumnsOptions(),
    update: false,
    nullable: true,
  })
  auditUpdatedAt?: number;

  // TODO: set proper values once we have authentication
  @Column({ nullable: false })
  auditCreatedBy: string;

  @Column({ nullable: true })
  auditUpdatedBy?: string;

  @BeforeInsert()
  public setCreatedBy() {
    this.auditCreatedBy = 'setAuditCreatedBy here';
  }

  @BeforeUpdate()
  public setAuditUpdatedBy() {
    this.auditCreatedBy = 'setAuditUpdatedBy here';
  }
}
