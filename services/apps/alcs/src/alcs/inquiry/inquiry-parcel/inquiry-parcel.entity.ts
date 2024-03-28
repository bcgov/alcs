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
