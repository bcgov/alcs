import { IsEmail, IsString } from 'class-validator';
import { AUTH_ROLE } from '../common/enum';

export class CreateOrUpdateUserDto {
  @IsEmail()
  email: string;

  @IsString({ each: true })
  roles: string[];
}

export class UserDto {
  @IsEmail()
  email: string;

  @IsString({ each: true })
  roles: AUTH_ROLE[];
}
