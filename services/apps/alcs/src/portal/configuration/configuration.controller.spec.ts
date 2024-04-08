import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationController } from './configuration.controller';

describe('ConfigurationController', () => {
  let controller: ConfigurationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationController],
      providers: [],
    }).compile();

    controller = module.get<ConfigurationController>(ConfigurationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
