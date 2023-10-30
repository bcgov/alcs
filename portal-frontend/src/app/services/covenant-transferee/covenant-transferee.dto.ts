import { BaseCodeDto } from '../../shared/dto/base.dto';

export enum OWNER_TYPE {
  INDIVIDUAL = 'INDV',
  ORGANIZATION = 'ORGZ',
}

export interface OwnerTypeDto extends BaseCodeDto {
  code: OWNER_TYPE;
}

export interface CovenantTransfereeDto {
  uuid: string;
  applicationSubmissionUuid: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  phoneNumber: string | null;
  email: string | null;
  type: OwnerTypeDto;
}

export interface CovenantTransfereeUpdateDto {
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
  phoneNumber: string;
  email: string;
  typeCode: string;
}

export interface CovenantTransfereeCreateDto extends CovenantTransfereeUpdateDto {
  applicationSubmissionUuid: string;
}
