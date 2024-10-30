import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationTagService } from './application-tag.service';

describe('ApplicationTagService', () => {
  let service: ApplicationTagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationTagService],
    }).compile();

    service = module.get<ApplicationTagService>(ApplicationTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
