import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HealthCheck extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1657753460650, type: 'bigint' })
  updateDate: string;
}
