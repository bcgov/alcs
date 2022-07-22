import { Column, Entity, ManyToOne } from 'typeorm';
import { Application } from './application.entity';

@Entity()
export class ApplicationHistory extends Application {
  @Column({ nullable: false, unique: true })
  startDate: string;

  @Column({ nullable: false })
  endDate: string;
}
