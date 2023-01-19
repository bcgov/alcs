import { AutoMap } from '@automapper/classes';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from '../../../document/document.entity';
import { ApplicationParcel } from '../application-parcel.entity';

export const DOCUMENT_TYPES = ['certificateOfTitle'] as const;
export type DOCUMENT_TYPE = 'certificateOfTitle';

@Entity()
export class ApplicationParcelDocument extends BaseEntity {
  constructor(data?: Partial<ApplicationParcelDocument>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  type: string;

  @ManyToOne(() => ApplicationParcel, { nullable: false })
  applicationParcel: ApplicationParcel;

  @Column({
    comment: 'Application parcel uuid',
  })
  applicationParcelUuid: string;

  @OneToOne(() => Document, {
    nullable: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  document: Document;
}
