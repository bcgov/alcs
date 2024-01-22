import { BaseCodeDto } from './base.dto';

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
