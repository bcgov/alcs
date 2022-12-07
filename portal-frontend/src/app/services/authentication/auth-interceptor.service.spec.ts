import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
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
      schemas: [NO_ERRORS_SCHEMA],
    });
    service = TestBed.inject(AuthInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
