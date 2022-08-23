import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JWK, JWS } from 'node-jose';
import { firstValueFrom } from 'rxjs';
import { CreateOrUpdateUserDto } from '../../user/user.dto';
import { UserService } from '../../user/user.service';
import { CONFIG_TOKEN, IConfig } from '../config/config.module';

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

type BaseToken = {
  identity_provider: string;
  preferred_username: string;
  display_name: string;
  email: string;
  email_verified: boolean;
  client_roles?: string[];
};

export type IdirToken = BaseToken & {
  name: string;
  identity_provider: 'idir';
  given_name: string;
  family_name: string;
  idir_user_guid?: string;
  idir_username?: string;
};

export type BCeIDBasicToken = BaseToken & {
  identity_provider: 'bceidboth';
  bceid_user_guid: string;
  bceid_username: string;
};

@Injectable()
export class AuthorizationService {
  private jwks: JWK.KeyStore;
  private logger: Logger = new Logger(AuthorizationService.name);

  constructor(
    private httpService: HttpService,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private userService: UserService,
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

  async exchangeCodeForToken(code: string) {
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
      const decodedToken = JSON.parse(
        Buffer.from(payload.payload).toString(),
      ) as BaseToken;
      this.logger.debug(decodedToken);

      this.registerUser(decodedToken);

      return {
        token: res.data,
        roles: decodedToken.client_roles,
      };
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

  private mapUserFromTokenToCreateDto(user: BaseToken): CreateOrUpdateUserDto {
    if (user.identity_provider === 'idir') {
      const idirToken = user as IdirToken;
      return {
        email: idirToken.email,
        name: idirToken.name,
        displayName: idirToken.display_name,
        identityProvider: idirToken.identity_provider,
        preferredUsername: idirToken.preferred_username,
        givenName: idirToken.given_name,
        familyName: idirToken.family_name,
        idirUserGuid: idirToken.idir_user_guid,
        idirUserName: idirToken.idir_username,
      };
    }
    if (user.identity_provider === 'bceidboth') {
      const bceidToken = user as BCeIDBasicToken;
      return {
        email: bceidToken.email,
        displayName: bceidToken.display_name,
        identityProvider: bceidToken.identity_provider,
        preferredUsername: bceidToken.preferred_username,
        bceidGuid: bceidToken.bceid_user_guid,
        bceidUserName: bceidToken.bceid_username,
      };
    }
  }

  private async registerUser(payload: BaseToken) {
    const existingUser = await this.userService.get(payload.email);
    if (!existingUser) {
      this.logger.debug(payload);
      await this.userService.create(this.mapUserFromTokenToCreateDto(payload));
    }
  }
}
