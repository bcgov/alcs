import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationPausedService } from './application-paused.service';

describe('ApplicationPausedService', () => {
  let service: ApplicationPausedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationPausedService],
    }).compile();

    service = module.get<ApplicationPausedService>(ApplicationPausedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
