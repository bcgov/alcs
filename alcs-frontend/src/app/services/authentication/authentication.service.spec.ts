import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthenticationService } from './authentication.service';

const mockToken = {
  exp: 1,
};

jest.mock('jwt-decode', () => (token: string) => mockToken);

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpClient: DeepMocked<HttpClient>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(() => {
    httpClient = createMock();
    mockRouter = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: httpClient,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    });
    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should publish the token its values when tokens are set', async () => {
    await service.setTokens('token', 'refreshToken');
    const user = await firstValueFrom(service.$currentUser);
    expect(user).toBeDefined();
    expect(user).toEqual(mockToken);
    expect(localStorage.getItem('jwt_token')).toEqual('token');
  });

  it('should clear the tokens from local storage', async () => {
    await service.setTokens('token', 'refreshToken');
    expect(localStorage.getItem('jwt_token')).toEqual('token');
    expect(localStorage.getItem('refresh_token')).toEqual('refreshToken');

    await service.clearTokens();
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('should navigate to login if both tokens are expired', async () => {
    await service.setTokens('token', 'refreshToken');
    mockRouter.navigateByUrl.mockResolvedValue(true);

    httpClient.get.mockReturnValue(
      of({
        refresh_token: 'newRefreshToken',
        token: 'newToken',
      })
    );

    await service.getToken();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigateByUrl.mock.calls[0][0]).toContain('login');
  });

  it('should fetch logout URL and clear tokens on logout', async () => {
    const fakeUrl = 'logout-url';
    httpClient.get.mockReturnValue(
      of({
        url: fakeUrl,
      })
    );

    window = Object.create(window);
    const url = 'http://alcs.fakewebsite';
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
      },
      writable: true,
    });

    await service.setTokens('token', 'refreshToken');
    expect(localStorage.getItem('jwt_token')).toEqual('token');
    expect(localStorage.getItem('refresh_token')).toEqual('refreshToken');

    await service.logout();
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(window.location.href).toEqual(fakeUrl);
  });

  it('should use the error URL to redirect if token is not valid on init', async () => {
    const fakeLoginUrl = 'login-url';

    window = Object.create(window);
    const url = 'http://alcs.fakewebsite';
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
      },
      writable: true,
    });

    httpClient.get.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            error: fakeLoginUrl,
            status: 401,
          })
      )
    );

    await service.getToken();

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(window.location.href).toEqual(fakeLoginUrl);
  });
});
