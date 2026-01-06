import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService, ICurrentUser } from '../authentication/authentication.service';

import { UserService } from './user.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UserService', () => {
  let service: UserService;
  let mockAuthService: DeepMocked<AuthenticationService>;

  beforeEach(() => {
    mockAuthService = createMock();
    mockAuthService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    TestBed.configureTestingModule({
    imports: [MatSnackBarModule],
    providers: [
        {
            provide: AuthenticationService,
            useValue: mockAuthService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
