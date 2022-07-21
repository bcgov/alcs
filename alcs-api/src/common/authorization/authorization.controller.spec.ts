import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { FastifyReply } from 'fastify';
import { CONFIG_TOKEN } from '../config/config.module';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';

describe('AuthorizationController', () => {
  let controller: AuthorizationController;
  let mockService: DeepMocked<AuthorizationService>;
  let fakeToken = 'fake-token';

  beforeEach(async () => {
    mockService = createMock<AuthorizationService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorizationController],
      providers: [
        {
          provide: AuthorizationService,
          useValue: mockService,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    controller = module.get<AuthorizationController>(AuthorizationController);

    mockService.exchangeCodeForToken.mockResolvedValue({
      access_token: fakeToken,
      refresh_token: '',
      id_token: '',
      expired_in: 1,
      session_state: '',
      token_type: 'mock',
      refresh_expires_in: 1,
      scope: '',
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should provide an access token on the return url', async () => {
    const res = createMock<FastifyReply>();
    await controller.handleAuth('code', 'session', res);

    const frontEndUrl = config.get('FRONTEND_ROOT');

    expect(res.status).toHaveBeenCalledWith(302);
    expect(res.redirect).toHaveBeenCalledWith(
      `${frontEndUrl}/authorized?t=${fakeToken}`,
    );
  });
});
