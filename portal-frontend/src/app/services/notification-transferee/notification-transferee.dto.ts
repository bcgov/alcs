import { BaseCodeDto } from '../../shared/dto/base.dto';

export enum OWNER_TYPE {
  INDIVIDUAL = 'INDV',
  ORGANIZATION = 'ORGZ',
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

export interface NotificationTransfereeUpdateDto {
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
  phoneNumber: string;
  email: string;
  typeCode: string;
}

export interface NotificationTransfereeCreateDto extends NotificationTransfereeUpdateDto {
  notificationSubmissionUuid: string;
}
