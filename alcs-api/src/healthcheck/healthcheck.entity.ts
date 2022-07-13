import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HealthCheck {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: BigInt(new Date().getTime()).toString(), type: 'bigint' })
  UpdateDate: string;
}
