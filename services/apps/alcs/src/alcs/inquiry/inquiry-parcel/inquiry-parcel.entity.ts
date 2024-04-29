import { AutoMap } from 'automapper-classes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { Inquiry } from '../inquiry.entity';

@Entity({ comment: 'Parcels associated with the inquiries' })
export class InquiryParcel extends Base {
  constructor(data?: Partial<InquiryParcel>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'The Parcels pid entered by the user or populated from third-party data',
    nullable: true,
  })
  pid?: string | null;

  @AutoMap(() => String)
  @Column({
    type: 'text',
    comment:
      'The Parcels pin entered by the user or populated from third-party data',
    nullable: true,
  })
  pin?: string | null;

  @Column({
    type: 'text',
    nullable: true,
    select: false,
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_subject_property_id to alcs.inquiry_parcel.',
  })
  oatsSubjectPropertyId?: string | null;

  @Column({
    type: 'text',
    nullable: true,
    select: false,
    comment:
      'This column is NOT related to any functionality in ALCS. It is only used for ETL and backtracking of imported data from OATS. It links oats.oats_property_id to alcs.inquiry_parcel.',
  })
  oatsPropertyId?: string | null;

  @AutoMap(() => String)
  @Column({
    comment: 'The standard address for the parcel',
  })
  civicAddress: string;

  @AutoMap()
  @ManyToOne(() => Inquiry, (inquiry) => inquiry.parcels, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  inquiry: Inquiry;

  @AutoMap()
  @Column()
  inquiryUuid: string;
}
