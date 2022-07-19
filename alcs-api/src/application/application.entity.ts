import { Base } from '../common/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ApplicationStatus } from '../application-status/application-status.entity';

@Entity()
export class Application extends Base {
  @Column({ nullable: false, unique: true })
  fileNumber: string;

  @Column({ nullable: false })
  title: string;

  @Column()
  body: string;

  @Column({
    type: 'uuid',
    nullable: false,
    default: 'e0083fa2-9457-433b-b711-9344e1e3fd48',
  })
  statusId: string;

  @ManyToOne((status) => ApplicationStatus)
  status: ApplicationStatus;
}
