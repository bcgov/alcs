import { IsEmail, IsString } from 'class-validator';

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

export class UserDto extends CreateOrUpdateUserDto {
  @IsString()
  uuid: string;
}
