import { TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService, ICurrentUser } from './authentication.service';
import { TokenRefreshService } from './token-refresh.service';

describe('TokenRefreshService', () => {
  let service: TokenRefreshService;
  let mockAuthService: AuthenticationService;

  beforeEach(() => {
    mockAuthService = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
    });
    service = TestBed.inject(TokenRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should subscribe to the current user on init', () => {
    mockAuthService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    expect(mockAuthService.$currentUser.observed).toBeFalsy();
    service.init();
    expect(mockAuthService.$currentUser.observed).toBeTruthy();
  });
});
