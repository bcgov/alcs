import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService, ICurrentUser } from './authentication.service';
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

    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

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
    const canActivate = await guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(canActivate).toBeTrue();
  });

  it('should redirect to login when there is no token', async () => {
    mockAuthService.getToken.and.resolveTo(undefined);
    const canActivate = await guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(canActivate).toBeFalse();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should redirect to provision when user has no roles', async () => {
    mockAuthService.getCurrentUser.and.returnValue({} as ICurrentUser);
    const canActivate = await guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(canActivate).toBeFalse();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/provision');
  });
});
