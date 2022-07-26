import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHistory } from '../common/entities/history.entity';
import { Application } from './application.entity';

@Entity()
export class ApplicationHistory extends EntityHistory {
  constructor() {
    super();
  }

  @Column({
    type: 'uuid',
  })
  statusUuid: string;

  @ManyToOne(() => Application, (application) => application.history)
  application: Application;
}
