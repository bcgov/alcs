import { SetMetadata } from '@nestjs/common';

export const UserRoles = (...roles: string[]) =>
  SetMetadata('userRoles', roles);
