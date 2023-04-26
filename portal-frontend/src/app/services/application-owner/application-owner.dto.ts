import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { ApplicationParcelDto } from '../application-parcel/application-parcel.dto';

export enum APPLICATION_OWNER {
  INDIVIDUAL = 'INDV',
  ORGANIZATION = 'ORGZ',
  AGENT = 'AGEN',
  CROWN = 'CRWN',
}

export interface ApplicationOwnerTypeDto extends BaseCodeDto {
  code: APPLICATION_OWNER;
}

export interface ApplicationOwnerDto {
  uuid: string;
  applicationSubmissionUuid: string;
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
  applicationSubmissionUuid: string;
}

export interface SetPrimaryContactDto {
  agentFirstName?: string;
  agentLastName?: string;
  agentOrganization?: string;
  agentPhoneNumber?: string;
  agentEmail?: string;
  ownerUuid?: string;
  applicationSubmissionUuid: string;
}
