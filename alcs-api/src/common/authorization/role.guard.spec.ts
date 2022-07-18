import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard as KeyCloakRoleGuard } from 'nest-keycloak-connect';
import { UserService } from '../../user/user.service';
import { AUTH_ROLE } from '../enum';
import { mockKeyCloakProviders } from '../utils/test-helpers/mockTypes';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: DeepMocked<Reflector>;
  let mockUserService: DeepMocked<UserService>;

  const mockHttpContext = {
    getRequest: () => ({
      user: {
        email: 'test@test.com',
        email_verified: true,
      },
    }),
  } as any;

  beforeEach(async () => {
    reflector = createMock<Reflector>();
    mockUserService = createMock<UserService>();
    reflector.get.mockReturnValue([AUTH_ROLE.ADMIN, AUTH_ROLE.USER]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        ...mockKeyCloakProviders,
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

    guard = module.get<RoleGuard>(RoleGuard);
    guard.keyCloakGuard = createMock<KeyCloakRoleGuard>();
    guard.keyCloakGuard.canActivate = jest.fn(async () => true);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should reject if underlying keycloak fails', async () => {
    const mockContext = createMock<ExecutionContext>();
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

    reflector.get.mockReturnValue([AUTH_ROLE.ADMIN]);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeFalsy();
  });

  it('should reject if users has no matching roles', async () => {
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue(mockHttpContext);

    mockUserService.getUserRoles.mockResolvedValue([
      'invalid-role',
    ] as unknown as AUTH_ROLE[]);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeFalsy();
  });

  it('should accept if users has any of the roles', async () => {
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue(mockHttpContext);
    mockUserService.getUserRoles.mockResolvedValue([AUTH_ROLE.ADMIN]);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeTruthy();
  });

  it('should accept if users has all of the roles', async () => {
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp.mockReturnValue(mockHttpContext);

    mockUserService.getUserRoles.mockResolvedValue([
      AUTH_ROLE.ADMIN,
      AUTH_ROLE.USER,
    ]);

    const isAllowed = await guard.canActivate(mockContext);
    expect(isAllowed).toBeTruthy();
  });
});
