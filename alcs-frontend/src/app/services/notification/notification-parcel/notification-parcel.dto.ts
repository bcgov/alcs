export interface NotificationParcelDto {
  uuid: string;
  pid?: string | null;
  pin?: string | null;
  civicAddress?: string | null;
  legalDescription?: string | null;
  mapAreaHectares?: string | null;
  ownershipTypeCode?: string | null;
}
