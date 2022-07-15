import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
} from 'nest-keycloak-connect';
import { KeycloakMultiTenantService } from 'nest-keycloak-connect/services/keycloak-multitenant.service';
import { UserService } from '../../user/user.service';
import { RoleGuard } from './role.guard';
import { RoleGuard as KeyCloakRoleGuard } from 'nest-keycloak-connect';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;
  let mockUserService: Partial<UserService> = {};

  beforeEach(async () => {
    reflector = createMock<Reflector>();
    jest.spyOn(reflector, 'get').mockReturnValue(['admin', 'poweruser']);

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
          useValue: {},
        },
        KeycloakMultiTenantService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    reflector = new Reflector();
    guard = module.get<RoleGuard>(RoleGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should reject if underlying keycloak fails', async () => {
    const mockContext = createMock<ExecutionContext>();
    guard.keyCloakGuard = createMock<KeyCloakRoleGuard>();
    guard.keyCloakGuard.canActivate = jest.fn(async () => false);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeFalsy();
  });

  it('should reject if users email is not verified', async () => {
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        user: {
          email: 'test@test.com',
          email_verified: false,
        },
      }),
    } as any);

    guard.keyCloakGuard = createMock<KeyCloakRoleGuard>();
    guard.keyCloakGuard.canActivate = jest.fn(async () => true);
    reflector.get = jest.fn((): any => ['admin']);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeFalsy();
  });

  it('should reject if users has no matching roles', async () => {
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        user: {
          email: 'test@test.com',
          email_verified: true,
        },
      }),
    } as any);

    guard.keyCloakGuard = createMock<KeyCloakRoleGuard>();
    guard.keyCloakGuard.canActivate = jest.fn(async () => true);
    mockUserService.getUserRoles = jest.fn(async () => ['not-admin']);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeFalsy();
  });

  it('should accept if users has any of the roles', async () => {
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        user: {
          email: 'test@test.com',
          email_verified: true,
        },
      }),
    } as any);

    guard.keyCloakGuard = createMock<KeyCloakRoleGuard>();
    guard.keyCloakGuard.canActivate = jest.fn(async () => true);
    mockUserService.getUserRoles = jest.fn(async () => ['admin']);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeTruthy();
  });

  it('should accept if users has all of the roles', async () => {
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => ({
        user: {
          email: 'test@test.com',
          email_verified: true,
        },
      }),
    } as any);

    guard.keyCloakGuard = createMock<KeyCloakRoleGuard>();
    guard.keyCloakGuard.canActivate = jest.fn(async () => true);
    mockUserService.getUserRoles = jest.fn(async () => ['admin', 'poweruser']);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeTruthy();
  });
});
