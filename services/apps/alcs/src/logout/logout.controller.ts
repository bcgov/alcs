import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';

@Public()
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
    const logoutUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${encodeURIComponent(
      frontend,
    )}`;

    const siteMinderUrl = this.config.get<string>('SITEMINDER.LOGOUT_URL');
    const finalUrl = `${siteMinderUrl}${encodeURIComponent(logoutUrl)}`;

    return { url: finalUrl };
  }
}
