import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Keycloak } from 'keycloak-connect';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
  RoleGuard as KeyCloakRoleGuard,
} from 'nest-keycloak-connect';
import { KeycloakConnectConfig } from 'nest-keycloak-connect/interface/keycloak-connect-options.interface';
import { KeycloakMultiTenantService } from 'nest-keycloak-connect/services/keycloak-multitenant.service';
import { UserService } from '../../user/user.service';

export enum AUTH_ROLES {
  ADMIN = 'admin',
}

@Injectable()
export class RoleGuard implements CanActivate {
  public keyCloakGuard: KeyCloakRoleGuard;

  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private singleTenant: Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectConfig,
    @Inject(KEYCLOAK_LOGGER)
    private logger: Logger,
    private multiTenant: KeycloakMultiTenantService,
    private readonly reflector: Reflector,
    private userService: UserService,
  ) {
    this.keyCloakGuard = new KeyCloakRoleGuard(
      singleTenant,
      keycloakOpts,
      logger,
      multiTenant,
      reflector,
    );
  }

  async canActivate(context: ExecutionContext) {
    const canActivate = await this.keyCloakGuard.canActivate(context);
    if (!canActivate) {
      return false;
    }

    //Keycloak is good, load our own roles
    const requiredRoles = this.reflector.get<string[]>(
      'userRoles',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    if (!request.user.email_verified) {
      return false;
    }
    const email = request.user.email;
    const userRoles = await this.userService.getUserRoles(email);

    const matchingRoles = userRoles.filter((value) =>
      requiredRoles.includes(value),
    );

    //If user has at least one matching role, allow them through
    return matchingRoles.length > 0;
  }
}
