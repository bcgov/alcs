import { Controller, Get, Inject, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'nest-keycloak-connect';
import { CONFIG_TOKEN, IConfig } from '../config/config.module';
import { AuthorizationService } from './authorization.service';

@Controller('/authorize')
export class AuthorizationController {
  constructor(
    private authorizationService: AuthorizationService,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  @Get()
  @Public()
  async handleAuth(
    @Query('code') authCode: string,
    @Query('session_state') sessionId: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const token = await this.authorizationService.exchangeCodeForToken(
        authCode,
      );

      //TODO: Set in Redis

      const frontEndUrl = this.config.get('FRONTEND_ROOT');
      res.status(302).redirect(`${frontEndUrl}/authorized?t=${token.id_token}`);
    } catch (e) {
      console.log(e);
    }
  }
}
