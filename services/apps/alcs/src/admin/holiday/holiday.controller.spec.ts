import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { HolidayController } from './holiday.controller';
import { HolidayUpdateDto } from './holiday.dto';
import { HolidayEntity } from './holiday.entity';
import { HolidayService } from './holiday.service';

describe('HolidayController', () => {
  let controller: HolidayController;
  let mockHolidayService: DeepMocked<HolidayService>;

  beforeEach(async () => {
    mockHolidayService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HolidayController],
      providers: [
        {
          provide: HolidayService,
          useValue: mockHolidayService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<HolidayController>(HolidayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching applications', async () => {
    mockHolidayService.fetch.mockResolvedValue([[], 0]);

    const holidays = await controller.fetch(0, 1);

    expect(holidays).toBeDefined();
    expect(mockHolidayService.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when updating holiday', async () => {
    mockHolidayService.update.mockResolvedValue({} as HolidayEntity);

    const holiday = await controller.update('fake', {} as HolidayUpdateDto);

    expect(holiday).toBeDefined();
    expect(mockHolidayService.update).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating holiday', async () => {
    mockHolidayService.create.mockResolvedValue({} as HolidayEntity);

    const holiday = await controller.create({} as HolidayUpdateDto);

    expect(holiday).toBeDefined();
    expect(mockHolidayService.create).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when deleting holiday', async () => {
    mockHolidayService.delete.mockResolvedValue({} as HolidayEntity);

    const holiday = await controller.delete('fake');

    expect(holiday).toBeDefined();
    expect(mockHolidayService.delete).toHaveBeenCalledTimes(1);
  });
});
