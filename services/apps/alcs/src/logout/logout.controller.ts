import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('logout')
export class LogoutController {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  @Get('/:frontend')
  async logout(@Param('frontend') targetFrontend: string) {
    const authServerUrl = this.config.get<string>('KEYCLOAK.AUTH_SERVER_URL');
    const realm = this.config.get<string>('KEYCLOAK.REALM');
    const clientId = this.config.get<string>('KEYCLOAK.CLIENT_ID');
    const frontend =
      targetFrontend === 'portal'
        ? this.config.get<string>('PORTAL.FRONTEND_ROOT')
        : this.config.get<string>('ALCS.FRONTEND_ROOT');
    const logoutUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/logout?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      frontend,
    )}`;
    return { url: logoutUrl };
  }
}
