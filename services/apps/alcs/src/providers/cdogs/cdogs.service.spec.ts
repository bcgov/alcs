import { Test, TestingModule } from '@nestjs/testing';
import { CdogsService } from './cdogs.service';

describe('CdogsService', () => {
  let service: CdogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CdogsService],
    }).compile();

    service = module.get<CdogsService>(CdogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
