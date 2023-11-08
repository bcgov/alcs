import { AutoMap } from 'automapper-classes';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { ApplicationDocumentDto } from '../../../alcs/application/application-document/application-document.dto';
import { ApplicationDocument } from '../../../alcs/application/application-document/application-document.entity';
import { Base } from '../../../common/entities/base.entity';
import { ParcelOwnershipType } from '../../../common/entities/parcel-ownership-type/parcel-ownership-type.entity';
import { ColumnNumericTransformer } from '../../../utils/column-numeric-transform';
import { ApplicationOwner } from '../application-owner/application-owner.entity';
import { ApplicationSubmission } from '../application-submission.entity';

@Entity()
export class ApplicationParcel extends Base {
  constructor(data?: Partial<ApplicationParcel>) {
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

  @AutoMap(() => String)
  @Column({
    type: 'boolean',
    comment: 'The Parcels indication whether it is used as a farm',
    nullable: true,
  })
  isFarm?: boolean | null;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'The Parcels purchase date provided by user',
  })
  purchasedDate?: Date | null;

  @AutoMap(() => Boolean)
  @Column({
    type: 'boolean',
    comment:
      'The Parcels indication whether applicant signed off provided data including the Certificate of Title',
    nullable: false,
    default: false,
  })
  isConfirmedByApplicant: boolean;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    comment:
      'The Parcels type, "other" means parcels not related to application but related to the owner',
    nullable: false,
    default: 'application',
  })
  parcelType?: string;

  @AutoMap()
  @ManyToOne(() => ApplicationSubmission)
  applicationSubmission: ApplicationSubmission;

  @AutoMap()
  @Column()
  applicationSubmissionUuid: string;

  @AutoMap(() => String)
  @Column({ nullable: true })
  ownershipTypeCode?: string | null;

  @AutoMap()
  @ManyToOne(() => ParcelOwnershipType)
  ownershipType: ParcelOwnershipType;

  @AutoMap(() => Boolean)
  @Column({
    type: 'text',
    comment:
      'For Crown Land parcels to indicate whether they are provincially owned or federally owned',
    nullable: true,
  })
  crownLandOwnerType?: string | null;

  @ManyToMany(() => ApplicationOwner, (owner) => owner.parcels)
  @JoinTable()
  owners: ApplicationOwner[];

  @AutoMap(() => ApplicationDocumentDto)
  @JoinColumn()
  @ManyToOne(() => ApplicationDocument, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  certificateOfTitle?: ApplicationDocument;

  @AutoMap(() => String)
  @Column({ nullable: true })
  certificateOfTitleUuid: string | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 15,
    scale: 5,
    transformer: new ColumnNumericTransformer(),
  })
  alrArea?: number | null;

  @Column({
    select: false,
    nullable: true,
    type: 'int8',
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_properties to alcs.application_parcel.',
  })
  oatsSubjectPropertyId: number;
}
