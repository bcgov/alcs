import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
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
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  startDate: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  endDate?: Date | null;

  @ManyToOne(() => Application, (application) => application.pauses, {
    cascade: true,
  })
  application: Application;

  @Column()
  applicationUuid: string;
}
