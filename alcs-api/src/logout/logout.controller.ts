import { Controller, Get, Inject, Res, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../common/authorization/role.guard';
import { UserRoles } from '../common/authorization/roles.decorator';
import { CONFIG_TOKEN, IConfig } from '../common/config/config.module';
import { ANY_AUTH_ROLE } from '../common/enum';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('logout')
@UseGuards(RoleGuard)
export class LogoutController {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async logout() {
    const authServerUrl = this.config.get<string>('KEYCLOAK.AUTH_SERVER_URL');
    const realm = this.config.get<string>('KEYCLOAK.REALM');
    const clientId = this.config.get<string>('KEYCLOAK.CLIENT_ID');
    const frontend = this.config.get<string>('FRONTEND_ROOT');
    const logoutUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/logout?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      frontend,
    )}`;
    return { url: logoutUrl };
  }
}
