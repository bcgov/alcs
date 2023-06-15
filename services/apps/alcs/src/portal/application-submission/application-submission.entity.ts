import { AutoMap } from '@automapper/classes';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Application } from '../../alcs/application/application.entity';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { ColumnNumericTransformer } from '../../utils/column-numeric-transform';
import { ApplicationOwner } from './application-owner/application-owner.entity';
import { ApplicationParcel } from './application-parcel/application-parcel.entity';
import { ApplicationStatus } from './application-status/application-status.entity';

export class StatusHistory {
  type: 'status_change';
  label: string;
  description: string;
  time: number;
}

export class ProposedLot {
  type: 'Lot' | 'Road Dedication';
  size: number;
}

@Entity()
export class ApplicationSubmission extends Base {
  constructor(data?: Partial<ApplicationSubmission>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @AutoMap({})
  @Column({
    comment: 'File Number of attached application',
  })
  fileNumber: string;

  @AutoMap({})
  @Column({
    comment: 'Indicates whether submission is currently draft or not',
    default: false,
  })
  isDraft: boolean;

  @AutoMap(() => String)
  @Column({
    type: 'varchar',
    comment: 'The Applicants name on the application',
    nullable: true,
  })
  applicant?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'uuid',
    comment: 'UUID from ALCS System of the Local Government',
    nullable: true,
  })
  localGovernmentUuid?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Used to store comments when an Application is returned to the Applicant',
    nullable: true,
  })
  returnedComment?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Quantify and describe in detail all agriculture that currently takes place on the parcel(s).',
    nullable: true,
  })
  parcelsAgricultureDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Quantify and describe in detail all agricultural improvements made to the parcel(s).',
    nullable: true,
  })
  parcelsAgricultureImprovementDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Quantify and describe all non-agricultural uses that currently take place on the parcel(s).',
    nullable: true,
  })
  parcelsNonAgricultureUseDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'The land uses surrounding the parcel(s) under application on the North.',
    nullable: true,
  })
  northLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Description of the land uses surrounding the parcel(s) under application on the North.',
    nullable: true,
  })
  northLandUseTypeDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'The land uses surrounding the parcel(s) under application on the East.',
    nullable: true,
  })
  eastLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Description of the land uses surrounding the parcel(s) under application on the East.',
    nullable: true,
  })
  eastLandUseTypeDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'The land uses surrounding the parcel(s) under application on the South.',
    nullable: true,
  })
  southLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Description of the land uses surrounding the parcel(s) under application on the South.',
    nullable: true,
  })
  southLandUseTypeDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'The land uses surrounding the parcel(s) under application on the West.',
    nullable: true,
  })
  westLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Description of the land uses surrounding the parcel(s) under application on the West.',
    nullable: true,
  })
  westLandUseTypeDescription?: string | null;

  @AutoMap()
  @ManyToOne(() => User)
  createdBy: User;

  @AutoMap()
  @ManyToOne(() => ApplicationStatus, { nullable: false, eager: true })
  status: ApplicationStatus;

  @Column()
  statusCode: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Stores Uuid of Owner Selected as Primary Contact',
  })
  primaryContactOwnerUuid?: string | null;

  @AutoMap()
  @Column({
    comment: 'Application Type Code from ALCS System',
  })
  typeCode: string;

  @AutoMap(() => StatusHistory)
  @Column({
    comment: 'JSONB Column containing the status history of the Application',
    type: 'jsonb',
    array: false,
    default: () => `'[]'`,
  })
  statusHistory: StatusHistory[];

  @OneToMany(() => ApplicationOwner, (owner) => owner.applicationSubmission)
  owners: ApplicationOwner[];

  @AutoMap(() => String)
  @Column({
    type: 'boolean',
    comment:
      'Indicates whether application owners have other parcels in the community.',
    nullable: true,
  })
  hasOtherParcelsInCommunity?: boolean | null;

  //NFU Specific Fields
  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  nfuHectares: number | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  nfuPurpose: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  nfuOutsideLands: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  nfuAgricultureSupport: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  nfuWillImportFill: boolean | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  nfuTotalFillPlacement: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  nfuMaxFillDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  nfuFillVolume: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  nfuProjectDurationAmount: number | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  nfuProjectDurationUnit: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  nfuFillTypeDescription: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  nfuFillOriginDescription: string | null;

  //TUR Specific Fields
  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  turPurpose: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  turAgriculturalActivities: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  turReduceNegativeImpacts: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  turOutsideLands: string | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  turTotalCorridorArea: number | null;

  @AutoMap(() => String)
  @Column({
    type: 'boolean',
    nullable: true,
  })
  turAllOwnersNotified?: boolean | null;

  //Subdivision Fields
  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  subdPurpose: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  subdSuitability: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  subdAgricultureSupport: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  subdIsHomeSiteSeverance: boolean | null;

  @AutoMap(() => [ProposedLot])
  @Column({
    comment: 'JSONB Column containing the proposed subdivision lots',
    type: 'jsonb',
    array: false,
    default: () => `'[]'`,
  })
  subdProposedLots: ProposedLot[];

  //Soil & Fill
  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  soilIsNOIFollowUp: boolean | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true, name: 'soil_noi_ids' })
  soilNOIIDs: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  soilHasPreviousALCAuthorization: boolean | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true, name: 'soil_application_ids' })
  soilApplicationIDs: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilPurpose: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilTypeRemoved: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilReduceNegativeImpacts: string | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToRemoveVolume: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToRemoveArea: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToRemoveMaximumDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToRemoveAverageDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilAlreadyRemovedVolume: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilAlreadyRemovedArea: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilAlreadyRemovedMaximumDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilAlreadyRemovedAverageDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToPlaceVolume: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToPlaceArea: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToPlaceMaximumDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilToPlaceAverageDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilAlreadyPlacedVolume: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilAlreadyPlacedArea: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilAlreadyPlacedMaximumDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilAlreadyPlacedAverageDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  soilProjectDurationAmount: number | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilProjectDurationUnit: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilFillTypeToPlace: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilAlternativeMeasures: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  soilIsExtractionOrMining: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  soilHasSubmittedNotice: boolean | null;

  //NARU
  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruSubtype: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruPurpose: string | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  naruFloorArea: number | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruResidenceNecessity: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruLocationRationale: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruInfrastructure: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruExistingStructures: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  naruWillImportFill: boolean | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruFillType: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruFillOrigin: string | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  naruProjectDurationAmount: number | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruProjectDurationUnit: string | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  naruToPlaceVolume: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  naruToPlaceArea: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  naruToPlaceMaximumDepth: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  naruToPlaceAverageDepth: number | null;

  @AutoMap(() => Application)
  @ManyToOne(() => Application)
  @JoinColumn({
    name: 'file_number',
    referencedColumnName: 'fileNumber',
  })
  application: Application;

  @AutoMap(() => ApplicationParcel)
  @OneToMany(
    () => ApplicationParcel,
    (appParcel) => appParcel.applicationSubmission,
  )
  parcels: ApplicationParcel[];
}
