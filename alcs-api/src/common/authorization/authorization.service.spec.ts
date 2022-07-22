import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { JWK, JWS } from 'node-jose';
import { of } from 'rxjs';
import { CONFIG_TOKEN } from '../config/config.module';
import { AuthorizationService } from './authorization.service';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let mockHttpService: DeepMocked<HttpService>;

  let fakeToken;

  beforeEach(async () => {
    mockHttpService = createMock<HttpService>();

    const keystore = JWK.createKeyStore();
    await keystore.generate('oct', 256);

    fakeToken = await JWS.createSign(
      {
        alg: 'RS256',
        format: 'compact',
      },
      keystore.all(),
    )
      .update('test-signer')
      .final();

    mockHttpService.get.mockReturnValue(
      of({
        data: keystore.toJSON(true),
      } as any),
    );

    mockHttpService.post.mockReturnValue(
      of({
        data: { id_token: fakeToken },
      } as any),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call out to keycloak when exchanging a code for token', async () => {
    const token = await service.exchangeCodeForToken('fake-code');

    expect(token).toEqual({ id_token: fakeToken });
    expect(mockHttpService.post).toHaveBeenCalled();
  });

  it('should call out to keycloak when refreshing a token', async () => {
    const token = await service.refreshToken('fake-refresh');

    expect(token).toEqual({ id_token: fakeToken });
    expect(mockHttpService.post).toHaveBeenCalled();
  });
});
