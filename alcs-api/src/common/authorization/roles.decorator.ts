import { SetMetadata } from '@nestjs/common';
import { AUTH_ROLE } from './roles';

export const UserRoles = (...roles: AUTH_ROLE[]) =>
  SetMetadata('userRoles', roles);
