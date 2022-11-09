import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { IsDefined } from 'class-validator';

export class UserSettingsDto {
  @AutoMap()
  favoriteBoards: string[];
}

export class UpdateUserDto {
  @AutoMap()
  @Type(() => UserSettingsDto)
  @IsDefined()
  settings: UserSettingsDto;
}

export class UserDto extends UpdateUserDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  initials: string;

  @AutoMap()
  name: string;

  @AutoMap()
  identityProvider: string;

  @AutoMap()
  clientRoles: string[];

  @AutoMap()
  idirUserName: string | undefined;

  @AutoMap()
  bceidUserName: string | undefined;
}

export class CreateUserDto {
  email: string;
  name?: string;
  displayName: string;
  givenName?: string;
  familyName?: string;
  preferredUsername: string;
  identityProvider: string;
  clientRoles: string[];
  idirUserName?: string;
  bceidUserName?: string;
  idirUserGuid?: string;
  bceidGuid?: string;
}

export class AssigneeDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  initials?: string;

  @AutoMap()
  name?: string;

  @AutoMap()
  mentionLabel: string;

  @AutoMap()
  email: string;

  @AutoMap()
  clientRoles: string[];
}
