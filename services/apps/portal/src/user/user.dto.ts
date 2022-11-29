import { AutoMap } from '@automapper/classes';

export class UserDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  name: string;

  @AutoMap()
  identityProvider: string;

  @AutoMap()
  clientRoles: string[];

  @AutoMap()
  bceidUserName?: string | null;
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
  bceidUserName?: string;
  bceidGuid: string;
}
