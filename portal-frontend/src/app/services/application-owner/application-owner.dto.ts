import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { ApplicationParcelDto } from '../application-parcel/application-parcel.dto';

export enum APPLICATION_OWNER {
  INDIVIDUAL = 'INDV',
  ORGANIZATION = 'ORGZ',
  AGENT = 'AGEN',
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
  corporateSummary?: ApplicationDocumentDto;
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
  applicationFileNumber: string;
}

export interface SetPrimaryContactDto {
  agentFirstName?: string;
  agentLastName?: string;
  agentOrganization?: string;
  agentPhoneNumber?: string;
  agentEmail?: string;
  ownerUuid?: string;
  fileNumber: string;
}
