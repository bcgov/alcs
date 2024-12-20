import { AutoMap } from 'automapper-classes';
import {
  AfterLoad,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApplicationSubmissionToSubmissionStatus } from '../../alcs/application/application-submission-status/submission-status.entity';
import { Application } from '../../alcs/application/application.entity';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { ColumnNumericTransformer } from '../../utils/column-numeric-transform';
import { ApplicationOwner } from './application-owner/application-owner.entity';
import { ApplicationParcel } from './application-parcel/application-parcel.entity';
import { NaruSubtype } from './naru-subtype/naru-subtype.entity';
import { ProposedStructure } from '../notice-of-intent-submission/notice-of-intent-submission.entity';

export class ProposedLot {
  type: 'Lot' | 'Road Dedication' | null;
  alrArea?: number | null;
  size: number | null;
  planNumbers: string | null;
}

export class ExistingResidence {
  floorArea: number;
  description: string;
}

export class ProposedResidence {
  floorArea: number;
  description: string;
}

@Entity({
  comment: 'Portal intake form fields for applications',
})
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

  @Index()
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
      'Used to store comments when an Application is returned to the L/FNG by ALC Staff',
    nullable: true,
  })
  returnedToLfngComment?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Describe all agriculture that currently takes place on the parcel(s).',
    nullable: true,
  })
  parcelsAgricultureDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Describe all agricultural improvements made to the parcel(s).',
    nullable: true,
  })
  parcelsAgricultureImprovementDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Describe all other uses that currently take place on the parcel(s).',
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

  @AutoMap(() => [ApplicationOwner])
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

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'Stores the data user entered about other parcels in their community',
    nullable: true,
  })
  otherParcelsDescription?: string;

  //NFU Specific Fields
  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 15,
    scale: 5,
    transformer: new ColumnNumericTransformer(),
  })
  nfuHectares: number | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  purpose: string | null;

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
    precision: 15,
    scale: 5,
    transformer: new ColumnNumericTransformer(),
  })
  nfuTotalFillArea: number | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  nfuAverageFillDepth: number | null;

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

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  nfuProjectDuration: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  nfuFillTypeDescription: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  nfuFillOriginDescription: string | null;

  //TUR Specific Fields
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
    precision: 15,
    scale: 5,
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
  soilIsNewStructure: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  soilIsFollowUp: boolean | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true, name: 'soil_follow_up_ids' })
  soilFollowUpIDs: string | null;

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
    precision: 15,
    scale: 5,
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
    precision: 15,
    scale: 5,
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
    precision: 15,
    scale: 5,
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
    precision: 15,
    scale: 5,
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

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilProjectDuration: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  fillProjectDuration: string | null;

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

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilStructureFarmUseReason: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilStructureResidentialUseReason: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilAgriParcelActivity: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilStructureResidentialAccessoryUseReason: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilStructureOtherUseReason: string | null;

  @AutoMap(() => ProposedStructure)
  @Column({
    comment: 'JSONB Column containing the proposed structures',
    type: 'jsonb',
    array: false,
    default: () => `'[]'`,
  })
  soilProposedStructures: ProposedStructure[];

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  naruWillBeOverFiveHundredM2: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  naruWillRetainResidence: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  naruWillHaveAdditionalResidence: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  naruWillHaveTemporaryForeignWorkerHousing: boolean | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  tfwhCount: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  tfwhDesign: boolean | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  tfwhFarmSize: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruClustered: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruSetback: string | null;

  //NARU
  @AutoMap(() => NaruSubtype)
  @ManyToOne(() => NaruSubtype)
  naruSubtype: NaruSubtype | null | undefined;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruSubtypeCode: string | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 15,
    scale: 5,
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

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruProjectDuration: string | null;

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
    precision: 15,
    scale: 5,
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

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  naruSleepingUnits: number | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  naruAgriTourism: string | null;

  @AutoMap(() => [ExistingResidence])
  @Column({
    comment: 'JSONB column containing NARU existing residences',
    type: 'jsonb',
    array: false,
    default: () => `'[]'`,
  })
  naruExistingResidences: ExistingResidence[];

  @AutoMap(() => [ProposedResidence])
  @Column({
    comment: 'JSONB column containing NARU proposed residences',
    type: 'jsonb',
    array: false,
    default: () => `'[]'`,
  })
  naruProposedResidences: ProposedResidence[];

  //Inclusion / Exclusion Fields

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  prescribedBody: string | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 15,
    scale: 5,
    transformer: new ColumnNumericTransformer(),
  })
  inclExclHectares: number | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  exclWhyLand: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  inclAgricultureSupport: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  inclImprovements: string | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  exclShareGovernmentBorders: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  inclGovernmentOwnsAllParcels: boolean | null;

  @AutoMap(() => Number)
  @Column({
    type: 'decimal',
    nullable: true,
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  coveAreaImpacted: number | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  coveHasDraft: boolean | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  coveFarmImpact: string | null;

  //END SUBMISSION FIELDS

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

  @OneToMany(
    () => ApplicationSubmissionToSubmissionStatus,
    (status) => status.submission,
    {
      eager: true,
      persistence: false,
    },
  )
  submissionStatuses: ApplicationSubmissionToSubmissionStatus[] = [];

  private _status: ApplicationSubmissionToSubmissionStatus;

  get status(): ApplicationSubmissionToSubmissionStatus {
    return this._status;
  }

  private set status(value: ApplicationSubmissionToSubmissionStatus) {
    this._status = value;
  }

  @AfterLoad()
  populateCurrentStatus() {
    // using JS date object is intentional for performance reasons
    const now = Date.now();

    for (const status of this.submissionStatuses) {
      const effectiveDate = status.effectiveDate?.getTime();

      if (
        effectiveDate &&
        effectiveDate <= now &&
        (!this.status ||
          status.statusType.weight > this.status.statusType.weight)
      ) {
        this.status = status;
      }
    }
  }
}
