import { AutoMap } from 'automapper-classes';
import { OwnerTypeDto } from '../../common/owner-type/owner-type.entity';
import { DocumentTypeDto } from '../../document/document.dto';
import { ApplicationParcelOwnershipTypeDto } from '../application-submission/application-parcel/application-parcel.dto';

export class PublicParcelDto {
  @AutoMap()
  uuid: string;

  @AutoMap(() => String)
  pid?: string | null;

  @AutoMap(() => String)
  pin?: string | null;

  @AutoMap(() => String)
  legalDescription?: string | null;

  @AutoMap(() => String)
  civicAddress?: string | null;

  @AutoMap(() => Number)
  mapAreaHectares?: number | null;

  @AutoMap(() => Number)
  purchasedDate?: number | null;

  @AutoMap(() => Boolean)
  isFarm?: boolean | null;

  @AutoMap(() => String)
  ownershipTypeCode?: string | null;

  @AutoMap(() => String)
  crownLandOwnerType?: string | null;

  ownershipType?: ApplicationParcelOwnershipTypeDto;

  @AutoMap(() => String)
  parcelType: string;

  @AutoMap(() => Number)
  alrArea: number | null;

  owners: PublicOwnerDto[];
}

export class PublicDocumentDto {
  @AutoMap(() => String)
  description?: string;

  @AutoMap()
  uuid: string;

  @AutoMap(() => DocumentTypeDto)
  type?: DocumentTypeDto;

  @AutoMap()
  source: string;

  //Document Fields
  documentUuid: string;
  fileName: string;
  fileSize?: number;
  mimeType: string;
  uploadedAt: number;
}

export class PublicOwnerDto {
  @AutoMap()
  uuid: string;

  displayName: string;

  @AutoMap(() => String)
  firstName?: string | null;

  @AutoMap(() => String)
  lastName?: string | null;

  @AutoMap(() => String)
  organizationName?: string | null;

  @AutoMap()
  type: OwnerTypeDto;
}
