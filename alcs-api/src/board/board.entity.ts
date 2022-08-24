import { AutoMap } from '@automapper/classes';
import { Column, Entity, OneToMany } from 'typeorm';
import { Application } from '../application/application.entity';
import { Base } from '../common/entities/base.entity';
import { BoardStatus } from './board-status.entity';

@Entity()
export class Board extends Base {
  @AutoMap()
  @Column({ unique: true })
  code: string;

  @AutoMap()
  @Column()
  title: string;

  @AutoMap()
  @Column()
  decisionMaker: string;

  @OneToMany(() => BoardStatus, (status) => status.board)
  statuses: BoardStatus[];

  @OneToMany(() => Application, (app) => app.board)
  applications: Application[];
}
