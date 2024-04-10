import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
  RoleGuard as KeyCloakRoleGuard,
} from 'nest-keycloak-connect';
import { KeycloakMultiTenantService } from 'nest-keycloak-connect/services/keycloak-multitenant.service';
import { ClsService } from 'nestjs-cls';
import { mockAppLoggerService } from '../../../test/mocks/mockLogger';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { AUTH_ROLE } from './roles';
import { RolesGuard } from './roles-guard.service';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: DeepMocked<Reflector>;
  let mockContext;
  let mockClsService: DeepMocked<ClsService>;
  let mockUserService: DeepMocked<UserService>;
  let mockRedisService: DeepMocked<RedisService>;

  const mockUser = {};

  const decodedToken = {
    client_roles: [AUTH_ROLE.ADMIN, AUTH_ROLE.LUP],
    email: 'fake-email',
    bceid_user_guid: 'fake-guid',
  };

  const mockHttpContext = {
    getRequest: () => ({
      user: decodedToken,
    }),
  } as any;

  beforeEach(async () => {
    mockContext = createMock();
    mockContext.switchToHttp.mockReturnValue(mockHttpContext);

    reflector = createMock();
    reflector.get.mockReturnValue([AUTH_ROLE.ADMIN, AUTH_ROLE.LUP]);

    mockClsService = createMock();
    mockUserService = createMock();
    mockRedisService = createMock();

    mockUserService.getByGuid.mockResolvedValue(mockUser as User);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: KEYCLOAK_INSTANCE,
          useValue: {},
        },
        {
          provide: KEYCLOAK_CONNECT_OPTIONS,
          useValue: {},
        },
        {
          provide: KEYCLOAK_LOGGER,
          useValue: mockAppLoggerService,
        },
        KeycloakMultiTenantService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ClsService,
          useValue: mockClsService,
        },
        {
          provide: Reflector,
          useValue: reflector,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    guard.keyCloakGuard = createMock<KeyCloakRoleGuard>();
    guard.keyCloakGuard.canActivate = jest.fn(async () => true);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should accept and set the user into CLS if users has all of the roles', async () => {
    const mockRedisClient = {
      get: jest.fn(),
    };
    mockRedisService.getClient.mockReturnValue(mockRedisClient as any);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeTruthy();
    expect(mockClsService.set).toHaveBeenCalledWith('userGuids', {
      bceidGuid: decodedToken.bceid_user_guid,
      idirUserGuid: undefined,
    });
  });

  it('should reject if underlying keycloak fails', async () => {
    guard.keyCloakGuard.canActivate = jest.fn(async () => false);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeFalsy();
  });

  it('should reject if users has no roles', async () => {
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        user: {
          client_roles: [],
        },
      }),
    } as any);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeFalsy();
  });

  it('should accept if users has one of the roles', async () => {
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        user: {
          client_roles: [AUTH_ROLE.ADMIN],
        },
      }),
    } as any);

    const mockRedisClient = {
      get: jest.fn(),
    };
    mockRedisService.getClient.mockReturnValue(mockRedisClient as any);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeTruthy();
  });

  it('should not call the user service if there is a the cached redis user', async () => {
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        user: {
          client_roles: [AUTH_ROLE.ADMIN],
        },
      }),
    } as any);

    const mockRedisClient = {
      get: jest.fn(),
    };
    mockRedisClient.get.mockResolvedValue(JSON.stringify(new User()));
    mockRedisService.getClient.mockReturnValue(mockRedisClient as any);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeTruthy();
    expect(mockUserService.getByGuid).toHaveBeenCalledTimes(0);
    expect(mockRedisClient.get).toHaveBeenCalledTimes(1);
  });
});
