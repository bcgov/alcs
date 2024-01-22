export interface UserDto {
  uuid: string;
  initials: string;
  name: string;
  identityProvider: string;
  idirUserName?: string | null;
  bceidUserName?: string | null;
  prettyName?: string | null;
  government?: string;
  isLocalGovernment: boolean;
  isFirstNationGovernment: boolean;
  businessName?: string | null;
}
