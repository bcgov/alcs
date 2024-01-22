import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { NoticeOfIntentOwnerDto } from '../notice-of-intent-owner/notice-of-intent-owner.dto';

export interface NoticeOfIntentParcelUpdateDto {
  uuid: string;
  pid?: string | null;
  pin?: string | null;
  civicAddress?: string | null;
  legalDescription?: string | null;
  mapAreaHectares?: string | null;
  purchasedDate?: number | null;
  isFarm?: boolean | null;
  ownershipTypeCode?: string | null;
  crownLandOwnerType?: string | null;
  isConfirmedByApplicant: boolean;
  ownerUuids: string[] | null;
}

export interface NoticeOfIntentParcelDto extends Omit<NoticeOfIntentParcelUpdateDto, 'ownerUuids'> {
  ownershipType?: BaseCodeDto;
  owners: NoticeOfIntentOwnerDto[];
  certificateOfTitle?: ApplicationDocumentDto;
}

export enum PARCEL_OWNERSHIP_TYPE {
  FEE_SIMPLE = 'SMPL',
  CROWN = 'CRWN',
}
