import { AutoMap } from '@automapper/classes';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Document } from '../../document/document.entity';
import { ApplicationParcel } from '../application-parcel/application-parcel.entity';
import { Application } from '../application.entity';
import { ApplicationOwnerType } from './application-owner-type/application-owner-type.entity';

@Entity()
export class ApplicationOwner extends Base {
  constructor(data?: Partial<ApplicationOwner>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
  })
  firstName?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
  })
  lastName?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
  })
  organizationName?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
  })
  phoneNumber?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
  })
  email?: string | null;

  @OneToOne(() => Document)
  @JoinColumn()
  corporateSummary: Document | null;

  @Column({ nullable: true })
  corporateSummaryUuid: string | null;

  @AutoMap()
  @ManyToOne(() => ApplicationOwnerType, { nullable: false })
  type: ApplicationOwnerType;

  @ManyToOne(() => Application, { nullable: false })
  application: Application;

  @Column()
  applicationFileNumber: string;

  @ManyToMany(() => ApplicationParcel, (appParcel) => appParcel.owners)
  parcels: ApplicationParcel[];
}
