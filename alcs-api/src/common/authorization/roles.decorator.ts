import { SetMetadata } from '@nestjs/common';
import { AUTH_ROLE } from '../enum';

export const UserRoles = (...roles: AUTH_ROLE[]) =>
  SetMetadata('userRoles', roles);
