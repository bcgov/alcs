import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { StatHolidayController } from './stat-holiday.controller';
import { HolidayUpdateDto } from './stat-holiday.dto';
import { HolidayEntity } from './stat-holiday.entity';
import { StatHolidayService } from './stat-holiday.service';

describe('StatHolidayController', () => {
  let controller: StatHolidayController;
  let mockStatHolidayService: DeepMocked<StatHolidayService>;

  beforeEach(async () => {
    mockStatHolidayService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatHolidayController],
      providers: [
        {
          provide: StatHolidayService,
          useValue: mockStatHolidayService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<StatHolidayController>(StatHolidayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching applications', async () => {
    mockStatHolidayService.fetch.mockResolvedValue([[], 0]);

    const holidays = await controller.fetch(0, 1);

    expect(holidays).toBeDefined();
    expect(mockStatHolidayService.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when updating holiday', async () => {
    mockStatHolidayService.update.mockResolvedValue({} as HolidayEntity);

    const holiday = await controller.update('fake', {} as HolidayUpdateDto);

    expect(holiday).toBeDefined();
    expect(mockStatHolidayService.update).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating holiday', async () => {
    mockStatHolidayService.create.mockResolvedValue({} as HolidayEntity);

    const holiday = await controller.create({} as HolidayUpdateDto);

    expect(holiday).toBeDefined();
    expect(mockStatHolidayService.create).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when deleting holiday', async () => {
    mockStatHolidayService.delete.mockResolvedValue({} as HolidayEntity);

    const holiday = await controller.delete('fake');

    expect(holiday).toBeDefined();
    expect(mockStatHolidayService.delete).toHaveBeenCalledTimes(1);
  });
});
