import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { ApplicationOwnerDto } from '../application-owner/application-owner.dto';

export interface ApplicationParcelUpdateDto {
  pid?: string | null;
  pin?: string | null;
  legalDescription?: string | null;
  mapAreaHectares?: string | null;
  purchasedDate?: number | null;
  isFarm?: boolean | null;
  ownershipTypeCode?: string | null;
  isConfirmedByApplicant: boolean;
}

export interface ApplicationParcelDto extends ApplicationParcelUpdateDto {
  uuid: string;
  owners: ApplicationOwnerDto[];
  documents: ApplicationDocumentDto[];
}
