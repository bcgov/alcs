import { AutoMap } from 'automapper-classes';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { ApplicationDocumentDto } from '../../../alcs/application/application-document/application-document.dto';
import { ApplicationDocument } from '../../../alcs/application/application-document/application-document.entity';
import { Base } from '../../../common/entities/base.entity';
import { ApplicationParcel } from '../application-parcel/application-parcel.entity';
import { ApplicationSubmission } from '../application-submission.entity';
import { OwnerType } from '../../../common/owner-type/owner-type.entity';

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

  @Column({
    select: false,
    nullable: true,
    type: 'int8',
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_person_organization to alcs.application_owner. Note that this id is unique only in scope of parcel.',
  })
  oatsPersonOrganizationId: number;

  @Column({
    select: false,
    nullable: true,
    type: 'int8',
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_application_parties to alcs.application_owner.',
  })
  oatsApplicationPartyId: number;

  @AutoMap(() => ApplicationDocumentDto)
  @ManyToOne(() => ApplicationDocument, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  corporateSummary: ApplicationDocument | null;

  @Column({ nullable: true })
  corporateSummaryUuid: string | null;

  @AutoMap()
  @ManyToOne(() => OwnerType, { nullable: false })
  type: OwnerType;

  @ManyToOne(() => ApplicationSubmission, { nullable: false })
  applicationSubmission: ApplicationSubmission;

  @AutoMap()
  @Column()
  applicationSubmissionUuid: string;

  @ManyToMany(() => ApplicationParcel, (appParcel) => appParcel.owners)
  parcels: ApplicationParcel[];
}
