export interface UserDto {
  uuid: string;

  email: string;

  name: string;

  displayName: string;

  identityProvider: string;

  preferredUsername: string;

  givenName?: string;

  familyName?: string;

  idirUserGuid?: string;

  idirUserName?: string;

  bceidUserName?: string;

  initials: string;

  mentionLabel: string;

  settings: IUserSettings;

  clientRoles: string[];
}

export interface IUserSettings {
  favoriteBoards: string[];
}
