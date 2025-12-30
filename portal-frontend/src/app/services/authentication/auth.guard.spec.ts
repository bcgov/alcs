import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { AuthGuard } from './auth.guard';
import { AuthenticationService } from './authentication.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: DeepMocked<AuthenticationService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(() => {
    mockAuthService = createMock();
    mockAuthService.getToken.mockResolvedValue('valid-token');

    mockRouter = createMock();

    TestBed.configureTestingModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule],
    providers: [
        {
            provide: AuthenticationService,
            useValue: mockAuthService,
        },
        {
            provide: Router,
            useValue: mockRouter,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when a token is present', async () => {
    const canActivate = await guard.canActivate();
    expect(canActivate).toBeTruthy();
  });

  it('should redirect to login when there is no token', async () => {
    mockAuthService.getToken.mockResolvedValue(undefined);
    const canActivate = await guard.canActivate();
    expect(canActivate).toBeFalsy();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
