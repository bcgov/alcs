import { Test, TestingModule } from '@nestjs/testing';
import { StatHolidayService } from './stat-holiday.service';

describe('StatHolidayService', () => {
  let service: StatHolidayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatHolidayService],
    }).compile();

    service = module.get<StatHolidayService>(StatHolidayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
