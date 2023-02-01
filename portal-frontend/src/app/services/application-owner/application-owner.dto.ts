import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationParcelDto } from '../application-parcel/application-parcel.dto';
import { ApplicationDocumentDto } from '../application/application.dto';

export enum APPLICATION_OWNER_TYPE {
  INDIVIDUAL = 'INDV',
  ORGANIZATION = 'ORGZ',
}

export interface ApplicationOwnerTypeDto extends BaseCodeDto {}

export interface ApplicationOwnerDto {
  uuid: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  phoneNumber: string | null;
  email: string | null;
  type: ApplicationOwnerTypeDto;
  corporateSummary: ApplicationDocumentDto;
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
}

export interface ApplicationOwnerCreateDto extends ApplicationOwnerUpdateDto {
  applicationFileId: string;
  parcelUuid: string;
}