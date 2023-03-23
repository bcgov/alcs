import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { FastifyReply } from 'fastify';
import { Keycloak } from 'keycloak-connect';
import { KEYCLOAK_INSTANCE } from 'nest-keycloak-connect';
import { AuthorizationFilter } from './authorization.filter';

describe('AuthorizationFilter', () => {
  let filter: AuthorizationFilter;
  let mockKeycloak: DeepMocked<Keycloak>;
  let mockRedisService: DeepMocked<RedisService>;

  beforeEach(async () => {
    mockKeycloak = createMock<Keycloak>();
    mockRedisService = createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationFilter,
        {
          provide: KEYCLOAK_INSTANCE,
          useValue: mockKeycloak,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    filter = module.get<AuthorizationFilter>(AuthorizationFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should send the response to the login url provided by keycloak', () => {
    const mockContext = createMock<ArgumentsHost>();
    const mockResponse = createMock<FastifyReply>();
    const fakeLoginUrl = 'fake-login-urk';

    mockContext.switchToHttp.mockReturnValue({
      getResponse: () => mockResponse,
      getStatus: () => 401,
    } as any);

    mockKeycloak.loginUrl.mockReturnValue(fakeLoginUrl);

    filter.catch(new UnauthorizedException(), mockContext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith(fakeLoginUrl);
  });
});
