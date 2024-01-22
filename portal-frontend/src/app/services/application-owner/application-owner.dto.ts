import { BaseCodeDto } from '../../shared/dto/base.dto';
import { OWNER_TYPE, OwnerTypeDto } from '../../shared/dto/owner.dto';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { ApplicationParcelDto } from '../application-parcel/application-parcel.dto';

export interface ApplicationOwnerDto {
  uuid: string;
  applicationSubmissionUuid: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  phoneNumber: string | null;
  email: string | null;
  type: OwnerTypeDto;
  corporateSummary?: ApplicationDocumentDto;
  crownLandOwnerType?: string | null;
}

export interface ApplicationOwnerDetailedDto extends ApplicationOwnerDto {
  parcels: ApplicationParcelDto[];
}

export interface ApplicationOwnerUpdateDto {
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
  phoneNumber: string;
  email: string;
  typeCode: string;
  corporateSummaryUuid?: string | null;
  crownLandOwnerType?: string | null;
}

export interface ApplicationOwnerCreateDto extends ApplicationOwnerUpdateDto {
  applicationSubmissionUuid: string;
}

export interface SetPrimaryContactDto {
  firstName?: string;
  lastName?: string;
  organization?: string;
  phoneNumber?: string;
  email?: string;
  type?: OWNER_TYPE;
  ownerUuid?: string;
  applicationSubmissionUuid: string;
}
