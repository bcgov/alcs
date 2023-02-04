import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HolidayEntity } from './stat-holiday.entity';
import { StatHolidayService } from './stat-holiday.service';

describe('StatHolidayService', () => {
  let service: StatHolidayService;
  let mockRepository: DeepMocked<Repository<HolidayEntity>>;

  const holiday = new HolidayEntity({
    day: new Date(1, 1),
    name: 'fake',
    uuid: 'mock',
  });

  beforeEach(async () => {
    mockRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        StatHolidayService,
        {
          provide: getRepositoryToken(HolidayEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StatHolidayService>(StatHolidayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully save holiday entry', async () => {
    mockRepository.save.mockResolvedValue({} as HolidayEntity);

    const result = await service.create({
      name: 'mock',
      day: 1,
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should successfully update holiday entry if it exists', async () => {
    mockRepository.save.mockResolvedValue(holiday);
    mockRepository.findOneOrFail.mockResolvedValue(holiday);

    const result = await service.update(holiday.uuid, {
      name: 'mock_update',
      day: 1,
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: holiday.uuid },
    });
    expect(result).toBeDefined();
  });

  it('should fail update holiday entry if it does not exist', async () => {
    mockRepository.save.mockResolvedValue({} as HolidayEntity);
    mockRepository.findOneOrFail.mockRejectedValue(new Error('mock error'));

    await expect(
      service.update('fake', {
        name: 'mock_update',
        day: 1,
      }),
    ).rejects.toMatchObject(new Error('mock error'));

    expect(mockRepository.save).toBeCalledTimes(0);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'fake' },
    });
  });

  it('should successfully delete holiday entry if it exists', async () => {
    mockRepository.remove.mockResolvedValue(holiday);
    mockRepository.findOneOrFail.mockResolvedValue(holiday);

    const result = await service.delete(holiday.uuid);

    expect(mockRepository.remove).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: holiday.uuid },
    });
    expect(result).toBeDefined();
  });

  it('should fail delete holiday entry if it does not exist', async () => {
    mockRepository.save.mockResolvedValue({} as HolidayEntity);
    mockRepository.findOneOrFail.mockRejectedValue(new Error('mock error'));

    await expect(service.delete('fake')).rejects.toMatchObject(
      new Error('mock error'),
    );

    expect(mockRepository.remove).toBeCalledTimes(0);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'fake' },
    });
  });

  it('should successfully fetch holidays', async () => {
    mockRepository.findAndCount.mockResolvedValue([[holiday], 1]);

    const result = await service.fetch(0, 1);

    expect(mockRepository.findAndCount).toBeCalledTimes(1);

    expect(mockRepository.findAndCount).toBeCalledWith({
      where: undefined,
      order: { day: 'DESC' },
      take: 1,
      skip: 0,
    });
    expect(result).toBeDefined();
  });
});
