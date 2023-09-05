import { AutoMap } from '@automapper/classes';
import { IsOptional, IsString } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { ParcelOwnershipType } from '../../../common/entities/parcel-ownership-type/parcel-ownership-type.entity';
import { NotificationSubmission } from '../notification-submission.entity';

@Entity()
export class NotificationParcel extends Base {
  constructor(data?: Partial<NotificationParcel>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    comment:
      'The Parcels pid entered by the user or populated from third-party data',
    nullable: true,
  })
  pid?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    comment:
      'The Parcels pin entered by the user or populated from third-party data',
    nullable: true,
  })
  pin?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    comment:
      'The Parcels legalDescription entered by the user or populated from third-party data',
    nullable: true,
  })
  legalDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    comment: 'The standard address for the parcel',
    nullable: true,
  })
  civicAddress?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'float',
    comment:
      'The Parcels map are in hectares entered by the user or populated from third-party data',
    nullable: true,
  })
  mapAreaHectares?: number | null;

  @AutoMap(() => Boolean)
  @Column({
    type: 'boolean',
    comment:
      'The Parcels indication whether applicant signed off provided data including the Certificate of Title',
    nullable: false,
    default: false,
  })
  isConfirmedByApplicant: boolean;

  @IsString()
  @IsOptional()
  crownLandOwnerType?: string | null;

  @AutoMap(() => String)
  @Column({ nullable: true })
  ownershipTypeCode?: string | null;

  @AutoMap()
  @ManyToOne(() => ParcelOwnershipType)
  ownershipType: ParcelOwnershipType;

  @AutoMap()
  @ManyToOne(() => NotificationSubmission)
  notificationSubmission: NotificationSubmission;

  @AutoMap()
  @Column()
  notificationSubmissionUuid: string;
}
