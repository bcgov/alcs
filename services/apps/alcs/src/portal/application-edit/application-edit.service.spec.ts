import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationEditService } from './application-edit.service';

describe('ApplicationEditService', () => {
  let service: ApplicationEditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationEditService],
    }).compile();

    service = module.get<ApplicationEditService>(ApplicationEditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
