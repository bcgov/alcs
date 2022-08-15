import { AutoMap } from '@automapper/classes';
import { IsEmail, IsString } from 'class-validator';

export class CreateOrUpdateUserDto {
  @AutoMap()
  @IsEmail()
  email: string;

  @AutoMap()
  @IsString()
  displayName: string;

  @AutoMap()
  @IsString()
  identityProvider: string;

  @AutoMap()
  @IsString()
  preferredUsername: string;

  @AutoMap()
  @IsString()
  name?: string;

  @AutoMap()
  @IsString()
  givenName?: string;

  @AutoMap()
  @IsString()
  familyName?: string;

  @AutoMap()
  @IsString()
  idirUserGuid?: string;

  @AutoMap()
  @IsString()
  idirUserName?: string;

  @AutoMap()
  @IsString()
  bceidGuid?: string;

  @AutoMap()
  @IsString()
  bceidUserName?: string;
}

export class UserDto extends CreateOrUpdateUserDto {
  @AutoMap()
  @IsString()
  uuid: string;

  @AutoMap()
  @IsString()
  initials?: string;

  @AutoMap()
  @IsString()
  mentionLabel: string;
}
