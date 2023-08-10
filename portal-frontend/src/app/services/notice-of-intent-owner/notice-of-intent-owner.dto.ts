import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { ApplicationParcelDto } from '../application-parcel/application-parcel.dto';

export enum OWNER_TYPE {
  INDIVIDUAL = 'INDV',
  ORGANIZATION = 'ORGZ',
  AGENT = 'AGEN',
  CROWN = 'CRWN',
  GOVERNMENT = 'GOVR',
}

export interface OwnerTypeDto extends BaseCodeDto {
  code: OWNER_TYPE;
}

export interface NoticeOfIntentOwnerDto {
  uuid: string;
  noticeOfIntentSubmissionUuid: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  phoneNumber: string | null;
  email: string | null;
  type: OwnerTypeDto;
  corporateSummary?: ApplicationDocumentDto;
}

export interface NoticeOfIntentOwnerDetailedDto extends NoticeOfIntentOwnerDto {
  parcels: ApplicationParcelDto[];
}

export interface NoticeOfIntentOwnerUpdateDto {
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
  phoneNumber: string;
  email: string;
  typeCode: string;
  corporateSummaryUuid?: string | null;
}

export interface NoticeOfIntentOwnerCreateDto extends NoticeOfIntentOwnerUpdateDto {
  noticeOfIntentSubmissionUuid: string;
}

export interface SetPrimaryContactDto {
  firstName?: string;
  lastName?: string;
  organization?: string;
  phoneNumber?: string;
  email?: string;
  type?: OWNER_TYPE;
  ownerUuid?: string;
  noticeOfIntentSubmissionUuid: string;
}
