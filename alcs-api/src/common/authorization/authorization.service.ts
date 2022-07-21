import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CONFIG_TOKEN, IConfig } from '../config/config.module';

export type TokenResponse = {
  access_token: string;
  expired_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token: string;
  session_state: string;
  scope: string;
};

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const baseUrl = this.config.get<string>('BASE_URL');
    const secret = this.config.get<string>('KEYCLOAK.SECRET');
    const clientId = this.config.get<string>('KEYCLOAK.CLIENT_ID');
    const tokenUrl = this.config.get<string>('KEYCLOAK.AUTH_TOKEN_URL');

    const res = await firstValueFrom(
      this.httpService.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: secret,
          redirect_uri: `${baseUrl}/authorize`,
        }),
      ),
    );

    return res.data;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const secret = this.config.get<string>('KEYCLOAK.SECRET');
    const clientId = this.config.get<string>('KEYCLOAK.CLIENT_ID');
    const tokenUrl = this.config.get<string>('KEYCLOAK.AUTH_TOKEN_URL');

    const res = await firstValueFrom(
      this.httpService.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: secret,
          refresh_token: refreshToken,
        }),
      ),
    );

    return res.data;
  }
}
