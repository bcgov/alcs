import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { of } from 'rxjs';
import { CONFIG_TOKEN } from '../config/config.module';
import { AuthorizationService } from './authorization.service';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let mockHttpService: DeepMocked<HttpService>;

  beforeEach(async () => {
    mockHttpService = createMock<HttpService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call out to keycloak when exchanging a code for token', async () => {
    const fakeToken = { access_token: 'fake-token' };
    mockHttpService.post.mockReturnValue(
      of({
        data: fakeToken,
      } as any),
    );

    const token = await service.exchangeCodeForToken('fake-code');

    expect(token).toEqual(fakeToken);
    expect(mockHttpService.post).toHaveBeenCalled();
  });

  it('should call out to keycloak when refreshing a token', async () => {
    const fakeToken = { access_token: 'fake-token' };
    mockHttpService.post.mockReturnValue(
      of({
        data: fakeToken,
      } as any),
    );

    const token = await service.refreshToken('fake-refresh');

    expect(token).toEqual(fakeToken);
    expect(mockHttpService.post).toHaveBeenCalled();
  });
});
