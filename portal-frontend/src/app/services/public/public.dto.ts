import { BaseCodeDto } from '../../shared/dto/base.dto';
import { DocumentTypeDto } from '../../shared/dto/document.dto';
import { OwnerTypeDto } from '../../shared/dto/owner.dto';

export interface PublicOwnerDto {
  uuid: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
  type: OwnerTypeDto;
}

export interface PublicDocumentDto {
  description?: string;
  uuid: string;
  type?: DocumentTypeDto;
  documentUuid: string;
  fileName: string;
  fileSize?: number;
  mimeType: string;
  uploadedAt: number;
}

export interface PublicParcelDto {
  uuid: string;
  pid?: string | null;
  pin?: string | null;
  legalDescription?: string | null;
  civicAddress?: string | null;
  mapAreaHectares?: number | null;
  purchasedDate?: number | null;
  isFarm?: boolean | null;
  ownershipTypeCode?: string | null;
  crownLandOwnerType?: string | null;
  ownershipType?: BaseCodeDto;
  parcelType: string;
  alrArea: number | null;
  owners: PublicOwnerDto[];
}
