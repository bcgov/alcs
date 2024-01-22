import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UpdateApplicationDecisionComponentLotDto } from './application-decision-component-lot.dto';
import { ApplicationDecisionComponentLot } from './application-decision-component-lot.entity';
import { ApplicationDecisionComponentLotService } from './application-decision-component-lot.service';

describe('ApplicationDecisionComponentLotService', () => {
  let service: ApplicationDecisionComponentLotService;
  let mockApplicationDecisionComponentLotRepository: DeepMocked<
    Repository<ApplicationDecisionComponentLot>
  >;

  beforeEach(async () => {
    mockApplicationDecisionComponentLotRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDecisionComponentLotService,
        {
          provide: getRepositoryToken(ApplicationDecisionComponentLot),
          useValue: mockApplicationDecisionComponentLotRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionComponentLotService>(
      ApplicationDecisionComponentLotService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update component lot', async () => {
    const dto = {
      alrArea: 1,
      uuid: '1',
    } as UpdateApplicationDecisionComponentLotDto;

    const lot = new ApplicationDecisionComponentLot();
    mockApplicationDecisionComponentLotRepository.findOneByOrFail.mockResolvedValue(
      lot,
    );
    const updatedLot = new ApplicationDecisionComponentLot({
      alrArea: dto.alrArea,
    });
    mockApplicationDecisionComponentLotRepository.save.mockResolvedValue(
      updatedLot,
    );

    const result = await service.update('1', dto);

    expect(result).toEqual(updatedLot);
    expect(mockApplicationDecisionComponentLotRepository.save).toBeCalledWith(
      updatedLot,
    );
    expect(mockApplicationDecisionComponentLotRepository.save).toBeCalledTimes(
      1,
    );
    expect(
      mockApplicationDecisionComponentLotRepository.findOneByOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionComponentLotRepository.findOneByOrFail,
    ).toBeCalledWith({ uuid: dto.uuid });
  });

  it('should soft remove by componentUuid', async () => {
    const lots = [
      new ApplicationDecisionComponentLot(),
      new ApplicationDecisionComponentLot(),
    ];
    mockApplicationDecisionComponentLotRepository.findBy.mockResolvedValue(
      lots,
    );
    mockApplicationDecisionComponentLotRepository.softRemove.mockResolvedValue(
      [] as any,
    );
    await service.softRemoveBy('1');
    expect(mockApplicationDecisionComponentLotRepository.findBy).toBeCalledWith(
      { componentUuid: '1' },
    );
    expect(
      mockApplicationDecisionComponentLotRepository.findBy,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionComponentLotRepository.softRemove,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionComponentLotRepository.softRemove,
    ).toBeCalledWith(lots);
  });

  it('should soft remove by uuids', async () => {
    const lots = [
      new ApplicationDecisionComponentLot(),
      new ApplicationDecisionComponentLot(),
    ];
    mockApplicationDecisionComponentLotRepository.findBy.mockResolvedValue(
      lots,
    );
    mockApplicationDecisionComponentLotRepository.softRemove.mockResolvedValue(
      [] as any,
    );
    await service.softRemove(['1', '2']);

    expect(mockApplicationDecisionComponentLotRepository.findBy).toBeCalledWith(
      { uuid: In(['1', '2']) },
    );
    expect(
      mockApplicationDecisionComponentLotRepository.findBy,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionComponentLotRepository.softRemove,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionComponentLotRepository.softRemove,
    ).toBeCalledWith(lots);
  });
});
