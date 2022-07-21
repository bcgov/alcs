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
import { CONFIG_TOKEN, IConfig } from '../config/config.module';

@Catch(UnauthorizedException)
export class AuthorizationFilter implements ExceptionFilter {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private singleTenant: Keycloak,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    //TODO: Store session in redis
    const sessionId = v4();

    const baseUrl = this.config.get<string>('BASE_URL');
    const loginUrl = this.singleTenant.loginUrl(
      sessionId,
      `${baseUrl}/authorize`,
    );

    response.status(status);
    response.send(loginUrl);
  }
}
