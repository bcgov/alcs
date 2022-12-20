import { Test, TestingModule } from '@nestjs/testing';
import { AlcsApplicationService } from './alcs-application.service';

describe('AlcsApplicationService', () => {
  let service: AlcsApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlcsApplicationService],
    }).compile();

    service = module.get<AlcsApplicationService>(AlcsApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.create).toBeDefined();
    expect(service.generateFileNumber).toBeDefined();
  });
});
