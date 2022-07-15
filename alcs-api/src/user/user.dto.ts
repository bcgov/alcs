import { AUTH_ROLE } from '../common/enum';

export class CreateOrUpdateUserDto {
  email: string;
  roles: string[];
}

export class UserDto {
  email: string;
  roles: AUTH_ROLE[];
}
