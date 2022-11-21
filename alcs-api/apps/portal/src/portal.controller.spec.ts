import { Test, TestingModule } from '@nestjs/testing';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

describe('PortalController', () => {
  let portalController: PortalController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PortalController],
      providers: [PortalService],
    }).compile();

    portalController = app.get<PortalController>(PortalController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(portalController.getHello()).toBe('Hello World!');
    });
  });
});
