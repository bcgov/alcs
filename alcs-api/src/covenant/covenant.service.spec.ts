import { Test, TestingModule } from '@nestjs/testing';
import { CovenantService } from './covenant.service';

describe('CovenantService', () => {
  let service: CovenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CovenantService],
    }).compile();

    service = module.get<CovenantService>(CovenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
