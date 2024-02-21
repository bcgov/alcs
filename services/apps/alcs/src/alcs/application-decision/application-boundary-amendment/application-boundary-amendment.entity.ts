import { AutoMap } from 'automapper-classes';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';

@Entity()
export class ApplicationBoundaryAmendment extends Base {
  constructor(data?: Partial<ApplicationBoundaryAmendment>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column({
    comment: 'File number of the application',
  })
  fileNumber: string;

  @Column({
    comment: 'Type of Amendment, Inclusion or Exclusion',
  })
  type: string;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 15,
    scale: 5,
    transformer: new ColumnNumericTransformer(),
    comment: 'Area in hectares of the amendment',
  })
  area: number;

  @AutoMap(() => Number)
  @Column({
    type: 'integer',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
    comment: 'Year the amendment took place',
  })
  year: number;

  @AutoMap(() => Number)
  @Column({
    type: 'smallint',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
    comment: 'Period of the year the amendment took place (1 - 4)',
  })
  period: number;

  @ManyToMany(() => ApplicationDecisionComponent)
  @JoinTable({
    name: 'application_boundary_amendments_to_components',
  })
  decisionComponents: ApplicationDecisionComponent[];
}
