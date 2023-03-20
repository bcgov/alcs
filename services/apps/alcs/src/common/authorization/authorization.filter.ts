import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { RedisService } from '@app/common/redis/redis.service';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { Keycloak } from 'keycloak-connect';
import { KEYCLOAK_INSTANCE } from 'nest-keycloak-connect';
import { v4 } from 'uuid';

@Catch(UnauthorizedException)
export class AuthorizationFilter implements ExceptionFilter {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private singleTenant: Keycloak,
    private redisService: RedisService,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const sessionId = v4();
    const baseUrl = this.config.get<string>('ALCS.BASE_URL');

    const redis = this.redisService.getClient();
    redis.set(`session_${sessionId}`, JSON.stringify({ source: 'alcs' }));

    const loginUrl = this.singleTenant.loginUrl(
      sessionId,
      `${baseUrl}/authorize`,
    );

    response.status(status);
    response.send(loginUrl);
  }
}
