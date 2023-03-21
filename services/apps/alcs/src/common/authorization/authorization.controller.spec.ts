import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { FastifyReply } from 'fastify';
import { ClsService } from 'nestjs-cls';
import { RedisClientType } from 'redis';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';

describe('AuthorizationController', () => {
  let controller: AuthorizationController;
  let mockService: DeepMocked<AuthorizationService>;
  let mockRedisService: DeepMocked<RedisService>;
  let mockRedisClient;

  const fakeToken = 'fake-token';
  const fakeRefreshToken = 'fake-refresh';
  const mockToken = {
    access_token: fakeToken,
    refresh_token: fakeRefreshToken,
    id_token: '',
    expires_in: 1,
    session_state: '',
    token_type: 'mock',
    refresh_expires_in: 1,
    scope: '',
  };

  beforeEach(async () => {
    mockService = createMock<AuthorizationService>();
    mockRedisService = createMock();
    mockRedisClient = createMock();
    mockRedisService.getClient.mockReturnValue(mockRedisClient);
    mockRedisClient.get.mockResolvedValue(undefined);
    mockRedisClient.set.mockResolvedValue({} as any);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorizationController],
      providers: [
        {
          provide: AuthorizationService,
          useValue: mockService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<AuthorizationController>(AuthorizationController);

    mockService.exchangeCodeForToken.mockResolvedValue(mockToken);
    mockService.refreshToken.mockResolvedValue(mockToken);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should provide an access token on the return url', async () => {
    const res = createMock<FastifyReply>();
    await controller.handleAuth('code', 'state', res);

    const frontEndUrl = config.get('PORTAL.FRONTEND_ROOT');

    expect(res.status).toHaveBeenCalledWith(302);
    expect(res.redirect).toHaveBeenCalledWith(
      `${frontEndUrl}/authorized?t=${fakeToken}&r=${fakeRefreshToken}`,
    );
  });

  it('should redirect to alcs if that was the state', async () => {
    const res = createMock<FastifyReply>();
    mockRedisClient.get.mockResolvedValue(
      JSON.stringify({
        source: 'alcs',
      }),
    );

    await controller.handleAuth('code', 'state', res);

    const frontEndUrl = config.get('ALCS.FRONTEND_ROOT');

    expect(res.status).toHaveBeenCalledWith(302);
    expect(res.redirect).toHaveBeenCalledWith(
      `${frontEndUrl}/authorized?t=${fakeToken}&r=${fakeRefreshToken}`,
    );
  });

  it('should refresh the token', async () => {
    const res = createMock<FastifyReply>();
    await controller.refreshToken('refresh-token', res);

    expect(res.send).toHaveBeenCalledWith({
      refresh_token: fakeRefreshToken,
      token: fakeToken,
    });
  });
});
