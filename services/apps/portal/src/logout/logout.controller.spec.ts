import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../alcs/test/mocks/mockTypes';
import { CONFIG_TOKEN } from '../common/config/config.module';
import { LogoutController } from './logout.controller';

describe('LogoutController', () => {
  let controller: LogoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogoutController],
      providers: [
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<LogoutController>(LogoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the logout URL', async () => {
    const authServer = config.get<string>('KEYCLOAK.AUTH_SERVER_URL');

    const url = await controller.logout();
    expect(url.url).toContain(authServer);
  });
});
