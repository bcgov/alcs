import { Test, TestingModule } from '@nestjs/testing';
import { StatHolidayController } from './stat-holiday.controller';

describe('StatHolidayController', () => {
  let controller: StatHolidayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatHolidayController],
    }).compile();

    controller = module.get<StatHolidayController>(StatHolidayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
