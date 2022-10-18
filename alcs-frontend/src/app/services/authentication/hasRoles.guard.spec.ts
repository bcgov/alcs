import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService, ICurrentUser, ROLES } from './authentication.service';
import { HasRolesGuard } from './hasRoles.guard';

describe('HasRolesGuard', () => {
  let guard: HasRolesGuard;
  let mockAuthService: jasmine.SpyObj<AuthenticationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthenticationService>('AuthenticationService', [
      'getToken',
      'getCurrentUser',
    ]);

    mockAuthService.getToken.and.resolveTo('valid-token');
    mockAuthService.getCurrentUser.and.resolveTo({
      client_roles: [ROLES.LUP],
    } as any);

    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigateByUrl', 'parseUrl']);
    mockRouter.parseUrl.and.callFake((route) => {
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
    expect(canActivate).toBeTrue();
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
    mockAuthService.getToken.and.resolveTo(undefined);
    const urlTree = await guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(typeof urlTree).toEqual('object');
    expect((urlTree as UrlTree).fragment).toEqual('/login');
  });

  it('should redirect to provision when user has no roles', async () => {
    mockAuthService.getCurrentUser.and.returnValue({} as ICurrentUser);
    const urlTree = await guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(typeof urlTree).toEqual('object');
    expect((urlTree as UrlTree).fragment).toEqual('/provision');
  });
});
