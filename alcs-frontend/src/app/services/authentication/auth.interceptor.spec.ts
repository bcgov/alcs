import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';

import { AuthInterceptor } from './auth.interceptor';
import { AuthenticationService, ICurrentUser } from './authentication.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuthInterceptor', () => {
  let service: AuthInterceptor;
  let mockAuthService: DeepMocked<AuthenticationService>;

  beforeEach(() => {
    mockAuthService = createMock();
    mockAuthService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        AuthInterceptor,
        {
            provide: AuthenticationService,
            useValue: mockAuthService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    service = TestBed.inject(AuthInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
