import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthenticationService, ICurrentUser, ROLES } from './authentication.service';
import { HasRolesGuard } from './hasRoles.guard';

describe('HasRolesGuard', () => {
  let guard: HasRolesGuard;
  let mockAuthService: DeepMocked<AuthenticationService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(() => {
    mockAuthService = createMock();

    mockAuthService.getToken.mockResolvedValue('valid-token');
    mockAuthService.getCurrentUser.mockReturnValue({
      client_roles: [ROLES.LUP],
    } as any);

    mockRouter = createMock();
    mockRouter.parseUrl.mockImplementation((route) => {
      const urlTree = new UrlTree();
      urlTree.fragment = route;
      return urlTree;
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    });
    guard = TestBed.inject(HasRolesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when a token is present', async () => {
    const canActivate = await guard.canActivate(
      {
        data: {
          roles: [ROLES.LUP],
        },
      } as any,
      {} as RouterStateSnapshot
    );
    expect(canActivate).toBeTruthy();
  });

  it('should go to home when route has no roles configured', async () => {
    const urlTree = await guard.canActivate(
      {
        data: {},
      } as any,
      {} as RouterStateSnapshot
    );
    expect(typeof urlTree).not.toEqual('boolean');
    expect((urlTree as UrlTree).fragment).toEqual('/home');
  });

  it('should redirect to login when there is no token', async () => {
    mockAuthService.getToken.mockResolvedValue(undefined);
    const urlTree = await guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(typeof urlTree).toEqual('object');
    expect((urlTree as UrlTree).fragment).toEqual('/login');
  });

  it('should redirect to provision when user has no roles', async () => {
    mockAuthService.getCurrentUser.mockReturnValue({} as ICurrentUser);
    const urlTree = await guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(typeof urlTree).toEqual('object');
    expect((urlTree as UrlTree).fragment).toEqual('/provision');
  });
});
