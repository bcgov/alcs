import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ApplicationRegion } from '../../../code/application-code/application-region/application-region.entity';
import { Base } from '../../../common/entities/base.entity';

@Entity()
export class ApplicationLocalGovernment extends Base {
  @AutoMap()
  @Column()
  name: string;

  @AutoMap(() => String)
  @Column({ unique: true, nullable: true, type: 'varchar' })
  bceidBusinessGuid: string | null;

  @Column({ default: false })
  isFirstNation: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text' })
  preferredRegionCode: string;

  @ManyToOne(() => ApplicationRegion, {
    nullable: false,
  })
  preferredRegion: ApplicationRegion;
}
