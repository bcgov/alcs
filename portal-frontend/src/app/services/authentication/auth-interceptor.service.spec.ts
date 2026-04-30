import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptorService } from './auth-interceptor.service';
import { AuthenticationService } from './authentication.service';

describe('AuthInterceptorService', () => {
  let service: AuthInterceptorService;
  let mockAuthService: DeepMocked<AuthenticationService>;

  beforeEach(() => {
    // const currentTokenUser$ = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    const mockAuthService = createMock();

    // (mockAuthService as any).$currentTokenUser = currentTokenUser$;

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
