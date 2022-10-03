import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ApplicationRegion } from '../application-region/application-region.entity';

@Entity()
export class ApplicationLocalGovernment extends Base {
  @Column()
  name: string;

  @ManyToOne(() => ApplicationRegion, {
    nullable: false,
  })
  preferredRegion: ApplicationRegion;
}
