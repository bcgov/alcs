import { IsEmail, IsString } from 'class-validator';
import { AUTH_ROLE } from '../common/enum';

export class CreateOrUpdateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  displayName: string;

  @IsString()
  identityProvider: string;

  @IsString()
  preferredUsername: string;

  @IsString()
  givenName: string;

  @IsString()
  familyName: string;

  @IsString()
  idirUserGuid?: string;

  @IsString()
  idirUserName?: string;
}

export class UserDto {
  @IsEmail()
  email: string;

  @IsString({ each: true })
  roles: AUTH_ROLE[];
}
