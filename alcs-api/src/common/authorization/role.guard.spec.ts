import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard as KeyCloakRoleGuard } from 'nest-keycloak-connect';
import { ClsService } from 'nestjs-cls';
import { AUTH_ROLE } from '../enum';
import { mockKeyCloakProviders } from '../utils/test-helpers/mockTypes';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: DeepMocked<Reflector>;
  let mockContext;
  let mockClsService: DeepMocked<ClsService>;

  const mockHttpContext = {
    getRequest: () => ({
      user: {
        client_roles: [AUTH_ROLE.ADMIN, AUTH_ROLE.LUP],
      },
    }),
  } as any;

  beforeEach(async () => {
    mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue(mockHttpContext);

    reflector = createMock<Reflector>();
    reflector.get.mockReturnValue([AUTH_ROLE.ADMIN, AUTH_ROLE.LUP]);

    mockClsService = createMock<ClsService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        ...mockKeyCloakProviders,
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
    expect(mockClsService.set).toHaveBeenCalledWith('userId', undefined);
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
