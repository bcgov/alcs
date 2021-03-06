import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../common/entities/base.entity';
import { Application } from './application.entity';

@Entity()
export class ApplicationPaused extends Base {
  constructor(data?: Partial<ApplicationPaused>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column({
    type: 'date',
    default: () => 'NOW()',
  })
  startDate: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  endDate?: Date;

  @ManyToOne(() => Application, (application) => application.history)
  application: Application;

  @Column()
  applicationUuid: string;
}
