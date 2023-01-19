import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Application } from '../application.entity';
import { ApplicationParcelDocument } from './application-parcel-document/application-parcel-document.entity';
import { ApplicationParcelOwnershipType } from './application-parcel-ownership-type/application-parcel-ownership-type.entity';

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

  @AutoMap(() => String)
  @Column({
    type: 'boolean',
    comment:
      'The Parcels indication whether applicant signed off provided data including the Certificate of Title',
    nullable: false,
    default: false,
  })
  isConfirmedByApplicant: boolean;

  @AutoMap()
  @Column({
    comment: 'The application file id that parcel is linked to',
    nullable: false,
  })
  applicationFileNumber?: string;

  @AutoMap()
  @ManyToOne(() => Application)
  application: Application;

  @AutoMap(() => String)
  @Column({ nullable: true })
  ownershipTypeCode?: string | null;

  @AutoMap()
  @ManyToOne(() => ApplicationParcelOwnershipType)
  ownershipType: ApplicationParcelOwnershipType;

  @AutoMap()
  @OneToMany(
    () => ApplicationParcelDocument,
    (appParcelDocument) => appParcelDocument.applicationParcel,
  )
  documents: ApplicationParcelDocument[];

  // TODO check if this works
  // setValue(propName: string, newVal) {
  //   this[propName] = newVal !== undefined ? newVal : this[propName];
  //   return this[propName];
  // }
}
