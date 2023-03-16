import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { Controller, Get, Inject, Logger, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Keycloak } from 'keycloak-connect';
import { KEYCLOAK_INSTANCE, Public } from 'nest-keycloak-connect';
import { v4 } from 'uuid';
import { AuthorizationService } from './authorization.service';

@Controller('/authorize')
export class AuthorizationController {
  private logger = new Logger(AuthorizationController.name);

  constructor(
    private authorizationService: AuthorizationService,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    @Inject(KEYCLOAK_INSTANCE) private keycloak: Keycloak,
  ) {}

  @Get()
  @Public()
  async handleAuth(@Query('code') authCode: string, @Res() res: FastifyReply) {
    try {
      const token = await this.authorizationService.exchangeCodeForToken(
        authCode,
      );

      const frontEndUrl = this.config.get('ALCS.FRONTEND_ROOT');

      res.status(302);
      res.redirect(
        `${frontEndUrl}/authorized?t=${token.access_token}&r=${token.refresh_token}`,
      );
    } catch (e) {
      console.log(e);
    }
  }

  @Get('/refresh')
  @Public()
  async refreshToken(@Query('r') authCode: string, @Res() res: FastifyReply) {
    try {
      const token = await this.authorizationService.refreshToken(authCode);
      this.logger.debug('Token Refreshed');
      res.send({
        refresh_token: token.refresh_token,
        token: token.access_token,
      });
    } catch (e) {
      console.log(e);
    }
  }

  @Get('/login')
  @Public()
  async getLoginUrl() {
    try {
      const sessionId = v4();
      const baseUrl = this.config.get<string>('PORTAL.BASE_URL');
      const loginUrl = this.keycloak.loginUrl(
        sessionId,
        `${baseUrl}/authorize`,
      );
      const idpHint = '&kc_idp_hint=bceidboth';
      return {
        loginUrl: loginUrl + idpHint,
      };
    } catch (e) {
      console.log(e);
    }
  }
}
