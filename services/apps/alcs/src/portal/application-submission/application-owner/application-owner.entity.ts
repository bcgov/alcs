import { AutoMap } from '@automapper/classes';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { ApplicationDocumentDto } from '../../../alcs/application/application-document/application-document.dto';
import { ApplicationDocument } from '../../../alcs/application/application-document/application-document.entity';
import { Base } from '../../../common/entities/base.entity';
import { ApplicationParcel } from '../application-parcel/application-parcel.entity';
import { ApplicationSubmission } from '../application-submission.entity';
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

  @AutoMap(() => ApplicationDocumentDto)
  @OneToOne(() => ApplicationDocument, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  corporateSummary: ApplicationDocument | null;

  @Column({ nullable: true })
  corporateSummaryUuid: string | null;

  @AutoMap()
  @ManyToOne(() => ApplicationOwnerType, { nullable: false })
  type: ApplicationOwnerType;

  @ManyToOne(() => ApplicationSubmission, { nullable: false })
  applicationSubmission: ApplicationSubmission;

  @Column()
  applicationSubmissionUuid: string;

  @ManyToMany(() => ApplicationParcel, (appParcel) => appParcel.owners)
  parcels: ApplicationParcel[];
}
