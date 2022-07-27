import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { ConfigModule } from '../../common/config/config.module';
import { BusinessDayService } from './business-day.service';
import { HolidayEntity } from './holiday.entity';

describe('BusinessDayService', () => {
  let service: BusinessDayService;
  let mockHolidayRespostory: DeepMocked<Repository<HolidayEntity>>;

  beforeEach(async () => {
    mockHolidayRespostory = createMock<Repository<HolidayEntity>>();

    mockHolidayRespostory.find.mockResolvedValue([
      {
        day: new Date('2022-06-15'),
        name: 'mock-holiday',
        uuid: 'mock-uuid',
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        BusinessDayService,
        {
          provide: getRepositoryToken(HolidayEntity),
          useValue: mockHolidayRespostory,
        },
      ],
    }).compile();

    service = module.get<BusinessDayService>(BusinessDayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should count 0 days when submission was on Saturday and today is Monday', () => {
    const startDate = dayjs('2022-06-25T16:00:00.000Z').toDate();
    const endDate = dayjs('2022-06-27T17:00:00.000Z').toDate();

    const calculatedDays = service.calculateDays(startDate, endDate);
    expect(calculatedDays).toEqual(0);
  });

  it('should count 1 day when submission was on Saturday and today is Tuesday', () => {
    const startDate = dayjs('2022-06-25T00:00:00.000Z').toDate();
    const endDate = dayjs('2022-06-28T00:00:00.000Z').toDate();

    const calculatedDays = service.calculateDays(startDate, endDate);
    expect(calculatedDays).toEqual(1);
  });

  it('should calculate the 5 business days for a full week', () => {
    const startDate = dayjs('2022-06-25T00:00:00.000Z').toDate();
    const endDate = dayjs('2022-07-02T00:00:00.000Z').toDate();

    const calculatedDays = service.calculateDays(startDate, endDate);
    expect(calculatedDays).toEqual(5);
  });

  it('should count 6 days when submission was on Saturday and today is Tuesday the week after', () => {
    const startDate = dayjs('2022-06-25T00:00:00.000Z').toDate();
    const endDate = dayjs('2022-07-05T00:00:00.000Z').toDate();

    const calculatedDays = service.calculateDays(startDate, endDate);
    expect(calculatedDays).toEqual(6);
  });

  it('should count 12 days when submission was on Thursday and today is Monday 2 weeks after', () => {
    const startDate = dayjs('2022-06-23T00:00:00.000Z').toDate();
    const endDate = dayjs('2022-07-11T00:00:00.000Z').toDate();

    const calculatedDays = service.calculateDays(startDate, endDate);
    expect(calculatedDays).toEqual(12);
  });

  it('should have 4 business days when one day in the week is a holiday', () => {
    const startDate = dayjs('2022-06-11T00:00:00.000Z').toDate();
    const endDate = dayjs('2022-06-18T00:00:00.000Z').toDate();

    const calculatedDays = service.calculateDays(startDate, endDate);
    expect(calculatedDays).toEqual(4);
  });
});
