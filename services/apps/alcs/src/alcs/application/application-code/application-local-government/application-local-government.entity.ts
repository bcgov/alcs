import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../../common/entities/base.entity';
import { ApplicationRegion } from '../../../code/application-code/application-region/application-region.entity';

@Entity()
export class ApplicationLocalGovernment extends Base {
  constructor(data?: Partial<ApplicationLocalGovernment>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

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

  @Column({ array: true, type: 'text', default: '{}' })
  emails: string[];

  @ManyToOne(() => ApplicationRegion, {
    nullable: false,
  })
  preferredRegion: ApplicationRegion;
}
