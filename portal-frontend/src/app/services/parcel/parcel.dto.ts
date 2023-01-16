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
  PID: string | undefined;
  PIN: string | undefined;
  legalDescription: string | undefined;
  mapAreaHectares: number | undefined;
  purchasedDate: number | undefined;
  isFarm: boolean | undefined;
  owners: ParcelOwnerDto[];
}
