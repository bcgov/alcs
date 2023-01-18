export interface ParcelLookupDto {
  legalDescription: string;
  mapArea: string;
  pin: string | undefined;
}
export interface ParcelOwnerDto {
  type: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  phoneNumber: string | undefined;
  email: string | undefined;
}
export interface ParcelDto {
  uuid: string;
  PID: string | undefined | null;
  PIN: string | undefined | null;
  legalDescription: string | undefined | null;
  mapAreaHectares: string | undefined | null;
  purchasedDate: number | undefined | null;
  isFarm: boolean | undefined;
  owners: ParcelOwnerDto[];
}
