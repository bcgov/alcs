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
import { ClsService } from 'nestjs-cls';
import { AUTH_ROLE } from '../enum';

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
    private readonly cls: ClsService,
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

    //Keycloak is good, use our own role checker
    const requiredRoles = this.reflector.get<AUTH_ROLE[]>(
      'userRoles',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const email = request.user.email;
    const userRoles = request.user.client_roles
      ? (request.user.client_roles as AUTH_ROLE[])
      : [];

    const matchingRoles = userRoles.filter((value) =>
      requiredRoles.includes(value),
    );

    this.cls.set('userEmail', email);

    if (matchingRoles.length === 0) {
      this.logger.debug(
        `Received request but user ${email} has wrong roles. Required: ${requiredRoles} Has: ${userRoles}`,
      );
    } else {
      this.logger.verbose(
        `Approved request with roles Required: ${requiredRoles} Has: ${userRoles}`,
      );
    }

    //If user has at least one matching role, allow them through
    return matchingRoles.length > 0;
  }
}
