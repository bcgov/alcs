import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';

import { AuthInterceptorService } from './auth-interceptor.service';
import { AuthenticationService, ICurrentUser } from './authentication.service';

describe('AuthInterceptorService', () => {
  let service: AuthInterceptorService;
  let mockAuthService: DeepMocked<AuthenticationService>;

  beforeEach(() => {
    mockAuthService = createMock();
    mockAuthService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
