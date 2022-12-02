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
import { mockAppLoggerService } from '../../../test/mocks/mockLogger';
import { RolesGuard } from './roles-guard.service';
import { AUTH_ROLE } from './roles';

describe('RoleGuard', () => {
  let guard: RolesGuard;
  let reflector: DeepMocked<Reflector>;
  let mockContext;
  let mockClsService: DeepMocked<ClsService>;
  let mockUserService: DeepMocked<UserService>;

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
    mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue(mockHttpContext);

    reflector = createMock<Reflector>();
    reflector.get.mockReturnValue([AUTH_ROLE.ADMIN, AUTH_ROLE.LUP]);

    mockClsService = createMock<ClsService>();
    mockUserService = createMock<UserService>();

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

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeTruthy();
  });
});
