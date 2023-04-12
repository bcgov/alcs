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
import { BaseToken } from '../../../../alcs/src/common/authorization/authorization.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class PortalAuthGuard implements CanActivate {
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
    private clsService: ClsService,
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

    const request = context.switchToHttp().getRequest();
    const token = request.user as BaseToken;

    const bceidGuid = token['bceid_user_guid'];
    this.clsService.set('userGuid', bceidGuid);
    const req = context.switchToHttp().getRequest();
    req.user.entity = await this.userService.getByGuid({ bceidGuid });

    return token.aud === this.keycloakOpts.resource;
  }
}
