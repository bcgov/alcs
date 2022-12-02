import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../alcs/test/mocks/mockTypes';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

describe('PortalController', () => {
  let portalController: PortalController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PortalController],
      providers: [PortalService, ...mockKeyCloakProviders],
    }).compile();

    portalController = app.get<PortalController>(PortalController);
  });

  it('should return "Token Valid"', () => {
    expect(portalController.checkTokenValid()).toBe('Token Valid');
  });
});
