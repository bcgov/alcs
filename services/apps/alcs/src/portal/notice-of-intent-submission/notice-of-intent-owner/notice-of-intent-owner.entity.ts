import { AutoMap } from 'automapper-classes';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { NoticeOfIntentDocumentDto } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocument } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { Base } from '../../../common/entities/base.entity';
import { OwnerType } from '../../../common/owner-type/owner-type.entity';
import { NoticeOfIntentParcel } from '../notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission.entity';

@Entity()
export class NoticeOfIntentOwner extends Base {
  constructor(data?: Partial<NoticeOfIntentOwner>) {
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
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_person_organization to alcs.notice_of_intent_owner. Note that this id is unique only in scope of parcel.',
  })
  oatsPersonOrganizationId: number;

  @Column({
    select: false,
    nullable: true,
    type: 'int8',
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_alr_application_parties to alcs.notice_of_intent_owner.',
  })
  oatsApplicationPartyId: number;

  @Column({
    select: false,
    nullable: true,
    type: 'int8',
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_property_interest to alcs.notice_of_intent_owner.',
  })
  oatsPropertyInterestId: number;

  @AutoMap(() => NoticeOfIntentDocumentDto)
  @ManyToOne(() => NoticeOfIntentDocument, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  corporateSummary: NoticeOfIntentDocument | null;

  @Column({ nullable: true })
  corporateSummaryUuid: string | null;

  @AutoMap()
  @ManyToOne(() => OwnerType, { nullable: false })
  type: OwnerType;

  @ManyToOne(() => NoticeOfIntentSubmission, { nullable: false })
  noticeOfIntentSubmission: NoticeOfIntentSubmission;

  @AutoMap()
  @Column()
  noticeOfIntentSubmissionUuid: string;

  @ManyToMany(() => NoticeOfIntentParcel, (appParcel) => appParcel.owners)
  parcels: NoticeOfIntentParcel[];
}
