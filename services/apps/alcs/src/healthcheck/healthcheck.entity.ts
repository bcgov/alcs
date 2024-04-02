import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  comment:
    'Unix timestamp of the last time the connection from API to database was checked and succeeded',
})
export class HealthCheck extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1657753460650, type: 'bigint' })
  updateDate: string;
}
