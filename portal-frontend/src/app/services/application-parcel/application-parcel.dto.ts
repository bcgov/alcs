import { ApplicationDocumentDto } from '../application/application.dto';

export interface ParcelOwnerDto {
  type: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  phoneNumber: string | undefined;
  email: string | undefined;
}

export interface ApplicationParcelUpdateDto {
  pid?: string | null;
  pin?: string | null;
  legalDescription?: string | null;
  mapAreaHectares?: string | null;
  purchasedDate?: number | null;
  isFarm?: boolean | null;
  ownershipTypeCode?: string | null;
  isConfirmedByApplicant: boolean;
}

export interface ApplicationParcelDto extends ApplicationParcelUpdateDto {
  uuid: string;
  owners: ParcelOwnerDto[];
  documents: ApplicationDocumentDto[];
}

export enum APPLICATION_PARCEL_DOCUMENT {
  CERTIFICATE_OF_TILE = 'certificateOfTitle',
}
