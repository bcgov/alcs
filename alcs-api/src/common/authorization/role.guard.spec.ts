import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
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
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { mockAppLoggerService } from '../utils/test-helpers/mockLogger';
import { RoleGuard } from './role.guard';
import { AUTH_ROLE } from './roles';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: DeepMocked<Reflector>;
  let mockContext;
  let mockClsService: DeepMocked<ClsService>;
  let mockUserService: DeepMocked<UserService>;

  const mockUser = {};

  const mockHttpContext = {
    getRequest: () => ({
      user: {
        client_roles: [AUTH_ROLE.ADMIN, AUTH_ROLE.LUP],
        email: 'fake-email',
      },
    }),
  } as any;

  beforeEach(async () => {
    mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue(mockHttpContext);

    reflector = createMock<Reflector>();
    reflector.get.mockReturnValue([AUTH_ROLE.ADMIN, AUTH_ROLE.LUP]);

    mockClsService = createMock<ClsService>();
    mockUserService = createMock<UserService>();

    mockUserService.getUser.mockResolvedValue(mockUser as User);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
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
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    guard.keyCloakGuard = createMock<KeyCloakRoleGuard>();
    guard.keyCloakGuard.canActivate = jest.fn(async () => true);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should accept and set the user into CLS if users has all of the roles', async () => {
    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeTruthy();
    expect(mockClsService.set).toHaveBeenCalledWith('userEmail', 'fake-email');
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

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeTruthy();
  });
});
