import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { ApplicationOwnerDto } from '../application-owner/application-owner.dto';

export interface ApplicationParcelUpdateDto {
  uuid: string;
  pid?: string | null;
  pin?: string | null;
  civicAddress?: string | null;
  legalDescription?: string | null;
  mapAreaHectares?: string | null;
  purchasedDate?: number | null;
  isFarm?: boolean | null;
  ownershipTypeCode?: string | null;
  crownLandOwnerType?: string | null;
  isConfirmedByApplicant: boolean;
  ownerUuids: string[] | null;
}

export interface ApplicationParcelDto extends Omit<ApplicationParcelUpdateDto, 'ownerUuids'> {
  parcelType: string;
  ownershipType?: BaseCodeDto;
  owners: ApplicationOwnerDto[];
  certificateOfTitle?: ApplicationDocumentDto;
}

export enum PARCEL_TYPE {
  APPLICATION = 'application',
  OTHER = 'other',
}

export enum PARCEL_OWNERSHIP_TYPE {
  FEE_SIMPLE = 'SMPL',
  CROWN = 'CRWN',
}
