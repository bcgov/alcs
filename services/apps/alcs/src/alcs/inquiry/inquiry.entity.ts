import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { FILE_NUMBER_SEQUENCE } from '../../file-number/file-number.constants';
import { User } from '../../user/user.entity';
import { Card } from '../card/card.entity';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { InquiryParcel } from './inquiry-parcel/inquiry-parcel.entity';
import { InquiryType } from './inquiry-type.entity';

@Entity({
  comment:
    'Inquiries from the public or other agencies that require a response from the ALC.',
})
export class Inquiry extends Base {
  constructor(data?: Partial<Inquiry>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @Column({
    unique: true,
    default: () => `NEXTVAL('${FILE_NUMBER_SEQUENCE}')`,
  })
  fileNumber: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'timestamptz' })
  dateSubmittedToAlc: Date;

  @Column({ type: 'varchar', nullable: true })
  inquirerFirstName?: string | null;

  @Column({ type: 'text', nullable: true })
  inquirerLastName?: string | null;

  @Column({ type: 'text', nullable: true })
  inquirerOrganization?: string | null;

  @Column({ type: 'text', nullable: true })
  inquirerPhone?: string | null;

  @Column({ type: 'text', nullable: true })
  inquirerEmail?: string | null;

  @Column({ default: true })
  open: boolean;

  @ManyToOne(() => User)
  closedBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  closedDate: Date | null;

  @Index()
  @Column({
    type: 'uuid',
  })
  localGovernmentUuid: string;

  @ManyToOne(() => LocalGovernment)
  localGovernment: LocalGovernment;

  @Column()
  regionCode: string;

  @ManyToOne(() => ApplicationRegion)
  region: ApplicationRegion;

  @Column()
  typeCode: string;

  @AutoMap(() => InquiryType)
  @ManyToOne(() => InquiryType, { nullable: false })
  type: InquiryType;

  @Column({ type: 'uuid', nullable: true })
  cardUuid: string | null;

  @OneToOne(() => Card, { cascade: true })
  @JoinColumn()
  @Type(() => Card)
  card: Card;

  @AutoMap(() => InquiryParcel)
  @OneToMany(() => InquiryParcel, (incParcel) => incParcel.inquiry)
  parcels: InquiryParcel[];
}
