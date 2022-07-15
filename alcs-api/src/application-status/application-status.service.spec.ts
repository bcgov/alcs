import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationStatusService } from './application-status.service';

describe('ApplicationStatusService', () => {
  let service: ApplicationStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationStatusService],
    }).compile();

    service = module.get<ApplicationStatusService>(ApplicationStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
