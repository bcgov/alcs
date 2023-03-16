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
import { UserGuids, UserService } from '../../user/user.service';
import { BaseToken } from './authorization.service';
import { AUTH_ROLE } from './roles';

@Injectable()
export class RolesGuard implements CanActivate {
  public keyCloakGuard: KeyCloakRoleGuard;

  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private singleTenant: Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectConfig,
    @Inject(KEYCLOAK_LOGGER)
    private logger: Logger,
    private multiTenant: KeycloakMultiTenantService,
    private reflector: Reflector,
    private cls: ClsService,
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

    //Keycloak is good, use our own role checker
    const requiredRoles = this.reflector.get<AUTH_ROLE[]>(
      'userRoles',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const token = request.user as BaseToken;

    if (token.aud !== this.keycloakOpts.resource) {
      return false;
    }

    const userRoles = request.user.client_roles
      ? (request.user.client_roles as AUTH_ROLE[])
      : [];

    const matchingRoles = userRoles.filter((value) =>
      requiredRoles.includes(value),
    );

    const userGuids: UserGuids = {
      bceidGuid: token['bceid_user_guid'],
      idirUserGuid: token['idir_user_guid'],
    };
    this.cls.set('userGuids', userGuids);

    if (matchingRoles.length === 0 && requiredRoles.length !== 0) {
      this.logger.debug(
        `Received request but user ${token.email} has wrong roles. Required: ${requiredRoles} Has: ${userRoles}`,
      );
    } else {
      this.logger.verbose(
        `Approved request with roles Required: ${requiredRoles} Has: ${userRoles}`,
      );
    }

    if (matchingRoles.length > 0 || requiredRoles.length === 0) {
      request.user.entity = await this.userService.getByGuid(userGuids);
      return true;
    }

    return false;
  }
}
