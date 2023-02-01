import { ApplicationOwnerDto } from '../application-owner/application-owner.dto';
import { ApplicationDocumentDto } from '../application/application.dto';

export interface ApplicationParcelUpdateDto {
  uuid: string;
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
  parcelType: string;
  owners: ApplicationOwnerDto[];
  documents: ApplicationDocumentDto[];
}

export interface ApplicationParcelOtherDto extends ApplicationParcelUpdateDto {
  parcelType: string;
  ownerUuid: string;
}

export enum PARCEL_TYPE {
  APPLICATION = 'application',
  OTHER = 'other',
}
