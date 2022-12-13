export interface UpdateUserDto {
  settings: UserSettingsDto;
}

export interface UserDto extends UpdateUserDto {
  uuid: string;
  initials: string;
  name: string;
  identityProvider: string;
  clientRoles: string[];
  idirUserName: string;
  bceidUserName: string;
  prettyName: string;
}

export interface UserSettingsDto {
  favoriteBoards: string[];
}

export interface AssigneeDto {
  uuid: string;
  initials?: string;
  name: string;
  email: string;
  mentionLabel: string;
  clientRoles: string[];
  prettyName: string;
}
