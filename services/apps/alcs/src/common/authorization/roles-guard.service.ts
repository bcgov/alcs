import { RedisService } from '@app/common/redis/redis.service';
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
  KeycloakConnectConfig,
  RoleGuard as KeyCloakRoleGuard,
} from 'nest-keycloak-connect';
import { ClsService } from 'nestjs-cls';
import { UserGuids, UserService } from '../../user/user.service';
import { BaseToken } from './authorization.service';
import { AUTH_ROLE } from './roles';

@Injectable()
export class RolesGuard implements CanActivate {
  public keyCloakGuard: KeyCloakRoleGuard;

  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    singleTenant: Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectConfig,
    @Inject(KEYCLOAK_LOGGER)
    private logger: Logger,
    private reflector: Reflector,
    private cls: ClsService,
    private userService: UserService,
    private redisService: RedisService,
  ) {
    this.keyCloakGuard = new KeyCloakRoleGuard(
      singleTenant,
      keycloakOpts,
      logger,
      null!,
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
      request.user.entity = await this.getAndCacheUser(userGuids);
      return true;
    }

    return false;
  }

  private async getAndCacheUser(userGuids: UserGuids) {
    const redisClient = this.redisService.getClient();
    const bceidUser = await redisClient.get(
      `user/bceid/${userGuids.bceidGuid}`,
    );
    if (bceidUser) {
      return JSON.parse(bceidUser);
    }

    const idirUser = await redisClient.get(
      `user/idir/${userGuids.idirUserGuid}`,
    );
    if (idirUser) {
      return JSON.parse(idirUser);
    }

    const user = await this.userService.getByGuid(userGuids);
    if (user) {
      const serialized = JSON.stringify(user);
      if (user.bceidGuid) {
        await redisClient.setEx(
          `user/bceid/${user.bceidGuid}`,
          600,
          serialized,
        );
      } else if (user.idirUserGuid) {
        await redisClient.setEx(
          `user/idir/${user.idirUserGuid}`,
          600,
          serialized,
        );
      }
    }
    return user;
  }
}
