import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { JWK, JWS } from 'node-jose';
import { of } from 'rxjs';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
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
      .update(`{"test_signer":"test-signer","identity_provider":"idir"}`)
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

    mockUserService.create.mockResolvedValue({
      clientRoles: [],
      bceidGuid: '',
      displayName: '',
      identityProvider: 'idir',
      uuid: 'user-uuid',
    } as Partial<User> as User);

    mockUserService.getByGuid.mockResolvedValue(null);
    mockUserService.sendNewUserRequestEmail.mockResolvedValue();

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
    const token = await service.exchangeCodeForToken('fake-code', false);

    expect(token).toEqual({ id_token: fakeToken });
    expect(mockHttpService.post).toHaveBeenCalledTimes(1);
  });

  it('should call out to keycloak when refreshing a token', async () => {
    const token = await service.refreshToken('fake-refresh');

    expect(token).toEqual({ id_token: fakeToken });
    expect(mockHttpService.post).toHaveBeenCalledTimes(1);
  });

  it('should call out CreateUser and SendEmail on receiving token if user is not registered and from ALCS', async () => {
    await service.exchangeCodeForToken('fake-code', false);

    expect(mockUserService.create).toBeCalledTimes(1);
    expect(mockUserService.sendNewUserRequestEmail).toBeCalledTimes(1);
  });

  it('should call out CreateUser and NOT SendEmail on receiving token if user is not registered and from Portal', async () => {
    await service.exchangeCodeForToken('fake-code', true);

    expect(mockUserService.create).toBeCalledTimes(1);
    expect(mockUserService.sendNewUserRequestEmail).toBeCalledTimes(0);
  });

  it('should call out CreateUser but not SendEmail on receiving token if user is not registered but has CSS roles assigned', async () => {
    mockUserService.create.mockResolvedValue({
      clientRoles: ['fake-role'],
    } as User);

    await service.exchangeCodeForToken('fake-code', false);

    expect(mockUserService.create).toBeCalledTimes(1);
    expect(mockUserService.sendNewUserRequestEmail).toBeCalledTimes(0);
  });

  it('should not call out CreateUser on receiving token if user is registered', async () => {
    mockUserService.getByGuid.mockResolvedValue(createMock<User>({} as User));
    mockUserService.update.mockResolvedValue(createMock<User>({} as User));
    await service.exchangeCodeForToken('fake-code', false);
    expect(mockUserService.create).toBeCalledTimes(0);
    expect(mockUserService.sendNewUserRequestEmail).toBeCalledTimes(0);
  });
});
