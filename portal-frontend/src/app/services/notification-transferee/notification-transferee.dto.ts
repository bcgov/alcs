import { BaseCodeDto } from '../../shared/dto/base.dto';

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

export interface NotificationTransfereeDto {
  uuid: string;
  notificationSubmissionUuid: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  phoneNumber: string | null;
  email: string | null;
  type: OwnerTypeDto;
}

export interface NotificationOwnerUpdateDto {
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
  phoneNumber: string;
  email: string;
  typeCode: string;
  corporateSummaryUuid?: string | null;
}

export interface NotificationOwnerCreateDto extends NotificationOwnerUpdateDto {
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
