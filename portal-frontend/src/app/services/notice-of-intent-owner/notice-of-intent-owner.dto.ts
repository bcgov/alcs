import { BaseCodeDto } from '../../shared/dto/base.dto';
import { NoticeOfIntentDocumentDto } from '../notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentParcelDto } from '../notice-of-intent-parcel/notice-of-intent-parcel.dto';

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
  corporateSummary?: NoticeOfIntentDocumentDto;
}

export interface NoticeOfIntentOwnerDetailedDto extends NoticeOfIntentOwnerDto {
  parcels: NoticeOfIntentParcelDto[];
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
