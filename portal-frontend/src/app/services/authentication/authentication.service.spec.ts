import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { firstValueFrom } from 'rxjs';

import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpClient: DeepMocked<HttpClient>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(() => {
    jest.mock('jwt-decode', () => (token: string) => ({
      cats: 'meow',
    }));

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

  it('should populate its values when tokens are set', async () => {
    await service.setTokens('token', 'refreshToken');
    const user = await firstValueFrom(service.$currentUser);
    expect(user).toBeDefined();
  });
});
