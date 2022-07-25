import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CONFIG_TOKEN, IConfig } from '../config/config.module';
import { JWK, JWS } from 'node-jose';
import { UserService } from '../../user/user.service';
import { CreateOrUpdateUserDto } from '../../user/user.dto';

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token: string;
  session_state: string;
  scope: string;
};

export type UserFromToken = {
  email: string;
  name: string;
  display_name: string;
  identity_provider: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  idir_user_guid?: string;
  idir_username?: string;
};

@Injectable()
export class AuthorizationService {
  private jwks: JWK.KeyStore;
  private readonly logger: Logger = new Logger(AuthorizationService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    @Inject(UserService) private readonly userService: UserService,
  ) {
    this.initKeys();
  }

  async initKeys() {
    const baseUrl = this.config.get('KEYCLOAK.AUTH_SERVER_URL');
    const realm = this.config.get('KEYCLOAK.REALM');
    const res = await firstValueFrom(
      await this.httpService.get(
        `${baseUrl}/realms/${realm}/protocol/openid-connect/certs`,
      ),
    );
    this.jwks = await JWK.asKeyStore(res.data);
  }

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

    const token = res.data;

    //Make sure token is legit, the Authguard will only do this on the next request
    const payload = await JWS.createVerify(this.jwks).verify(token.id_token);
    if (payload) {
      this.registerUser(payload.payload);
      return res.data;
    } else {
      throw new UnauthorizedException();
    }
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

  // FIXME: this will be replaced with automapper
  private mapUserFromTokenToCreateDto(
    user: UserFromToken,
  ): CreateOrUpdateUserDto {
    return {
      email: user.email,
      name: user.name,
      displayName: user.display_name,
      identityProvider: user.identity_provider,
      preferredUsername: user.preferred_username,
      givenName: user.given_name,
      familyName: user.family_name,
      idirUserGuid: user.idir_user_guid,
      idirUserName: user.idir_username,
    } as CreateOrUpdateUserDto;
  }

  private async registerUser(payload: Buffer) {
    const decodedToken = JSON.parse(
      Buffer.from(payload).toString(),
    ) as UserFromToken;
    this.logger.debug(decodedToken);
    const existingUser = await this.userService.getUser(decodedToken.email);
    if (!existingUser) {
      await this.userService.createUser(
        this.mapUserFromTokenToCreateDto(decodedToken),
      );
    }
  }
}
