import { Column, Entity, ManyToOne } from 'typeorm';
import { ApplicationRegion } from '../../../code/application-code/application-region/application-region.entity';
import { Base } from '../../../common/entities/base.entity';

@Entity()
export class ApplicationLocalGovernment extends Base {
  @Column()
  name: string;

  @ManyToOne(() => ApplicationRegion, {
    nullable: false,
  })
  preferredRegion: ApplicationRegion;
}
