import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';

export class ProposedLot {
  type: 'Lot' | 'Road Dedication' | null;
  alrArea?: number | null;
  size: number | null;
  planNumbers: string | null;
}

@Entity()
export class ApplicationDecisionComponentLot extends Base {
  constructor(data?: Partial<ApplicationDecisionComponentLot>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @Column({ type: 'int' })
  number: number;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    nullable: true,
  })
  type: 'Lot' | 'Road Dedication' | null;

  @AutoMap(() => Number)
  @Column({
    nullable: true,
    type: 'int',
  })
  alrArea?: number | null;

  @AutoMap(() => Number)
  @Column({
    nullable: true,
    type: 'int',
  })
  size?: number | null;

  @AutoMap()
  @Column()
  componentUuid: string;

  @ManyToOne(() => ApplicationDecisionComponent)
  @Type(() => ApplicationDecisionComponent)
  component: ApplicationDecisionComponent;
}
