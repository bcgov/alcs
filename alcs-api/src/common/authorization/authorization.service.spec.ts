import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { JWK, JWS } from 'node-jose';
import { of } from 'rxjs';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { CONFIG_TOKEN } from '../config/config.module';
import { AuthorizationService } from './authorization.service';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let mockHttpService: DeepMocked<HttpService>;
  let mockUserService: DeepMocked<UserService>;

  let fakeToken;

  beforeEach(async () => {
    mockHttpService = createMock<HttpService>();
    mockUserService = createMock<UserService>();

    const keystore = JWK.createKeyStore();
    await keystore.generate('oct', 256);

    fakeToken = await JWS.createSign(
      {
        alg: 'RS256',
        format: 'compact',
      },
      keystore.all(),
    )
      .update(`{"test_signer":"test-signer"}`)
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

    mockUserService.createUser.mockReturnValue(createMock<Promise<User>>());

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
        { provide: UserService, useValue: mockUserService },
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

  it('should call out CreateUser on receiving token', async () => {
    await service.exchangeCodeForToken('fake-code');
    expect(mockUserService.createUser).toBeCalledTimes(1);
  });
});
