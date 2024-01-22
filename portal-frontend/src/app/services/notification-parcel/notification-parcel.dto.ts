import { BaseCodeDto } from '../../shared/dto/base.dto';

export interface NotificationParcelUpdateDto {
  uuid: string;
  pid?: string | null;
  pin?: string | null;
  civicAddress?: string | null;
  legalDescription?: string | null;
  mapAreaHectares?: string | null;
  ownershipTypeCode?: string | null;
}

export interface NotificationParcelDto extends Omit<NotificationParcelUpdateDto, 'ownerUuids'> {
  ownershipType?: BaseCodeDto;
}

export enum PARCEL_OWNERSHIP_TYPE {
  FEE_SIMPLE = 'SMPL',
  CROWN = 'CRWN',
}
