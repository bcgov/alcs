import { AutoMap } from '@automapper/classes';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ApplicationDecisionConditionComponent extends BaseEntity {
  constructor(data?: Partial<ApplicationDecisionConditionComponent>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryColumn({
    type: 'uuid',
  })
  applicationDecisionConditionUuid: string;

  @AutoMap()
  @PrimaryColumn({
    type: 'uuid',
  })
  applicationDecisionComponentUuid: string;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    nullable: true,
  })
  planNumbers?: string | null;
}
