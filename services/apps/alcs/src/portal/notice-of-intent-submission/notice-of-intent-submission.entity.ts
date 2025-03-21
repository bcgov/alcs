import { AutoMap } from 'automapper-classes';
import { AfterLoad, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { ColumnNumericTransformer } from '../../utils/column-numeric-transform';
import { NoticeOfIntentOwner } from './notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from './notice-of-intent-parcel/notice-of-intent-parcel.entity';

export enum STRUCTURE_TYPES {
  FARM_STRUCTURE = 'Farm Structure',
  PRINCIPAL_RESIDENCE = 'Residential - Principal Residence',
  ADDITIONAL_RESIDENCE = 'Residential - Additional Residence',
  ACCESSORY_STRUCTURE = 'Residential - Accessory Structure',
  OTHER_STRUCTURE = 'Other Structure',
}

export const STRUCTURE_TYPE_LABEL_MAP: Record<STRUCTURE_TYPES, string> = {
  [STRUCTURE_TYPES.FARM_STRUCTURE]: STRUCTURE_TYPES.FARM_STRUCTURE,
  [STRUCTURE_TYPES.PRINCIPAL_RESIDENCE]: 'Principal Residence',
  [STRUCTURE_TYPES.ADDITIONAL_RESIDENCE]: 'Additional Residence',
  [STRUCTURE_TYPES.ACCESSORY_STRUCTURE]: 'Residential Accessory Structure',
  [STRUCTURE_TYPES.OTHER_STRUCTURE]: STRUCTURE_TYPES.OTHER_STRUCTURE,
};

export const PORTAL_TO_ALCS_STRUCTURE_MAP = {
  [STRUCTURE_TYPES.PRINCIPAL_RESIDENCE]: 'RPRI',
  [STRUCTURE_TYPES.ADDITIONAL_RESIDENCE]: 'RADD',
  [STRUCTURE_TYPES.ACCESSORY_STRUCTURE]: 'RACS',
  [STRUCTURE_TYPES.FARM_STRUCTURE]: 'FRST',
  [STRUCTURE_TYPES.OTHER_STRUCTURE]: 'OTHR',
};

export const PORTAL_TO_ALCS_TAGS_MAP = {
  [STRUCTURE_TYPES.PRINCIPAL_RESIDENCE]: 'Principal Residence',
  [STRUCTURE_TYPES.ADDITIONAL_RESIDENCE]: 'Additional Residence',
  [STRUCTURE_TYPES.ACCESSORY_STRUCTURE]: 'Accessory Structure',
  [STRUCTURE_TYPES.FARM_STRUCTURE]: 'Farm Structure',
  [STRUCTURE_TYPES.OTHER_STRUCTURE]: 'Other Structure',
};

export class ProposedStructure {
  type: keyof typeof PORTAL_TO_ALCS_STRUCTURE_MAP | null;
  area?: number | null;
}

@Entity({ comment: 'Portal intake form fields for NOIs' })
export class NoticeOfIntentSubmission extends Base {
  constructor(data?: Partial<NoticeOfIntentSubmission>) {
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
    type: 'varchar',
    comment: 'The purpose of the application',
    nullable: true,
  })
  purpose?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Describe all agriculture that currently takes place on the parcel(s).',
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
    comment: 'Describe all other uses that currently take place on the parcel(s).',
    nullable: true,
  })
  parcelsNonAgricultureUseDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'The land uses surrounding the parcel(s) under application on the North.',
    nullable: true,
  })
  northLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Description of the land uses surrounding the parcel(s) under application on the North.',
    nullable: true,
  })
  northLandUseTypeDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'The land uses surrounding the parcel(s) under application on the East.',
    nullable: true,
  })
  eastLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Description of the land uses surrounding the parcel(s) under application on the East.',
    nullable: true,
  })
  eastLandUseTypeDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'The land uses surrounding the parcel(s) under application on the South.',
    nullable: true,
  })
  southLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Description of the land uses surrounding the parcel(s) under application on the South.',
    nullable: true,
  })
  southLandUseTypeDescription?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'The land uses surrounding the parcel(s) under application on the West.',
    nullable: true,
  })
  westLandUseType?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment: 'Description of the land uses surrounding the parcel(s) under application on the West.',
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
    comment: 'Notice of Intent Type Code',
  })
  typeCode: string;

  //Soil & Fill
  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  soilIsFollowUp: boolean | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true, name: 'soil_follow_up_ids' })
  soilFollowUpIDs: string | null;

  @AutoMap(() => String)
  @Column({ type: 'text', nullable: true })
  soilTypeRemoved: string | null;

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

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  soilIsExtractionOrMining: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  soilIsAreaWideFilling: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  soilHasSubmittedNotice: boolean | null;

  @AutoMap(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  soilIsRemovingSoilForNewStructure: boolean | null;

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

  @AutoMap(() => NoticeOfIntent)
  @ManyToOne(() => NoticeOfIntent)
  @JoinColumn({
    name: 'file_number',
    referencedColumnName: 'fileNumber',
  })
  noticeOfIntent: NoticeOfIntent;

  @OneToMany(() => NoticeOfIntentOwner, (owner) => owner.noticeOfIntentSubmission)
  owners: NoticeOfIntentOwner[];

  @OneToMany(() => NoticeOfIntentParcel, (parcel) => parcel.noticeOfIntentSubmission)
  parcels: NoticeOfIntentParcel[];

  @OneToMany(() => NoticeOfIntentSubmissionToSubmissionStatus, (status) => status.submission, {
    eager: true,
    persistence: false,
  })
  submissionStatuses: NoticeOfIntentSubmissionToSubmissionStatus[] = [];

  private _status: NoticeOfIntentSubmissionToSubmissionStatus;

  get status(): NoticeOfIntentSubmissionToSubmissionStatus {
    return this._status;
  }

  private set status(value: NoticeOfIntentSubmissionToSubmissionStatus) {
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
        (!this.status || status.statusType.weight > this.status.statusType.weight)
      ) {
        this.status = status;
      }
    }
  }
}
