import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../../../libs/common/src/exceptions/base.exception';
import { ApplicationDecisionComponentLot } from '../../../application-component-lot/application-decision-component-lot.entity';
import { ApplicationDecisionComponentLotService } from '../../../application-component-lot/application-decision-component-lot.service';
import {
  APPLICATION_DECISION_COMPONENT_TYPE,
  CreateApplicationDecisionComponentDto,
  UpdateApplicationDecisionComponentDto,
} from './application-decision-component.dto';
import { ApplicationDecisionComponent } from './application-decision-component.entity';
import { ApplicationDecisionComponentService } from './application-decision-component.service';

describe('ApplicationDecisionComponentService', () => {
  let service: ApplicationDecisionComponentService;
  let mockApplicationDecisionComponentRepository: DeepMocked<Repository<ApplicationDecisionComponent>>;
  let mockApplicationDecisionComponentLotService: DeepMocked<ApplicationDecisionComponentLotService>;

  beforeEach(async () => {
    mockApplicationDecisionComponentRepository = createMock();
    mockApplicationDecisionComponentLotService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDecisionComponentService,
        {
          provide: getRepositoryToken(ApplicationDecisionComponent),
          useValue: mockApplicationDecisionComponentRepository,
        },
        {
          provide: ApplicationDecisionComponentLotService,
          useValue: mockApplicationDecisionComponentLotService,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionComponentService>(ApplicationDecisionComponentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repo to get one or fails with correct parameters', async () => {
    mockApplicationDecisionComponentRepository.findOneOrFail.mockResolvedValue(new ApplicationDecisionComponent());

    const result = await service.getOneOrFail('fake');

    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'fake' },
      relations: {
        lots: true,
      },
    });
    expect(result).toBeDefined();
  });

  it('calls componentRepository.softRemove() method and soft removes an array of components', async () => {
    const components = [new ApplicationDecisionComponent(), new ApplicationDecisionComponent()];

    mockApplicationDecisionComponentRepository.softRemove.mockResolvedValue({} as ApplicationDecisionComponent);

    await service.softRemove(components);

    expect(mockApplicationDecisionComponentRepository.softRemove).toHaveBeenCalledWith(components);
  });

  it('throws validation error if there are duplicate components', () => {
    const firstComponent = {
      uuid: 'fake',
      applicationDecisionComponentTypeCode: 'TURP',
      agCap: '1',
      agCapSource: '1',
      alrArea: 1,
    } as CreateApplicationDecisionComponentDto;

    const secondComponent = {
      uuid: 'fake-2',
      applicationDecisionComponentTypeCode: 'TURP',
      agCap: '2',
      agCapSource: '2',
      alrArea: 2,
    } as CreateApplicationDecisionComponentDto;

    firstComponent.applicationDecisionComponentTypeCode = 'fake';
    secondComponent.applicationDecisionComponentTypeCode = 'fake';

    const mockComponentsDto = [firstComponent, secondComponent];

    expect(() => {
      return service.validate(mockComponentsDto);
    }).toThrowError(ServiceValidationException);
  });

  it('does not throw if there are no duplicate components', () => {
    const firstComponent = {
      uuid: 'fake',
      applicationDecisionComponentTypeCode: 'TURP',
      agCap: '1',
      agCapSource: '1',
      alrArea: 1,
    } as CreateApplicationDecisionComponentDto;

    const secondComponent = {
      uuid: 'fake-2',
      applicationDecisionComponentTypeCode: 'fake',
      agCap: '2',
      agCapSource: '2',
      alrArea: 2,
    } as CreateApplicationDecisionComponentDto;

    const mockComponentsDto = [firstComponent, secondComponent];

    expect(() => {
      return service.validate(mockComponentsDto);
    }).not.toThrowError(ServiceValidationException);
  });

  it('should create new components when given a DTO without a UUID', async () => {
    mockApplicationDecisionComponentRepository.findOneOrFail.mockResolvedValue({} as ApplicationDecisionComponent);

    const updateDtos = [new CreateApplicationDecisionComponentDto(), new CreateApplicationDecisionComponentDto()];

    const result = await service.createOrUpdate(updateDtos, false);

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toBeCalledTimes(0);
  });

  it('should update existing components when given a DTO with a UUID', async () => {
    mockApplicationDecisionComponentRepository.findOneOrFail.mockResolvedValue({
      uuid: 'fake',
      applicationDecisionComponentTypeCode: 'fake_code',
    } as ApplicationDecisionComponent);

    const mockDto = new CreateApplicationDecisionComponentDto();
    mockDto.uuid = 'fake';
    mockDto.alrArea = 1;
    mockDto.agCap = '2';
    mockDto.agCapSource = '3';
    mockDto.agCapMap = '4';
    mockDto.agCapConsultant = '5';
    mockDto.applicationDecisionComponentTypeCode = 'should_not_beUpdated';

    const result = await service.createOrUpdate([mockDto], false);

    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'fake' },
      relations: {
        lots: true,
      },
    });
    expect(result[0].uuid).toEqual(mockDto.uuid);
    expect(result[0].alrArea).toEqual(mockDto.alrArea);
    expect(result[0].agCap).toEqual(mockDto.agCap);
    expect(result[0].agCapSource).toEqual(mockDto.agCapSource);
    expect(result[0].agCapMap).toEqual(mockDto.agCapMap);
    expect(result[0].agCapConsultant).toEqual(mockDto.agCapConsultant);
    expect(result[0].applicationDecisionComponentTypeCode).toEqual('fake_code');
  });

  it('should update only changed fields in DTO for a given UID', async () => {
    mockApplicationDecisionComponentRepository.findOneOrFail.mockResolvedValue({
      uuid: 'fake',
      applicationDecisionComponentTypeCode: 'fake_code',
      alrArea: 1,
      agCap: '2',
      agCapSource: '3',
      agCapMap: '4',
      agCapConsultant: '5',
    } as ApplicationDecisionComponent);

    const mockDto = new CreateApplicationDecisionComponentDto();
    mockDto.uuid = 'fake';
    mockDto.alrArea = 10;
    mockDto.applicationDecisionComponentTypeCode = 'should_not_beUpdated';

    const result = await service.createOrUpdate([mockDto], false);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toHaveBeenCalledWith({
      where: { uuid: 'fake' },
      relations: {
        lots: true,
      },
    });

    expect(result[0].uuid).toEqual(mockDto.uuid);
    expect(result[0].alrArea).toEqual(mockDto.alrArea);
    expect(result[0].agCap).toEqual('2');
    expect(result[0].agCapSource).toEqual('3');
    expect(result[0].agCapMap).toEqual('4');
    expect(result[0].agCapConsultant).toEqual('5');
    expect(result[0].applicationDecisionComponentTypeCode).toEqual('fake_code');
  });

  it('should persist entity if persist flag is true', async () => {
    mockApplicationDecisionComponentRepository.findOneOrFail.mockResolvedValue({} as ApplicationDecisionComponent);
    mockApplicationDecisionComponentRepository.save.mockResolvedValue({} as ApplicationDecisionComponent);

    const updateDtos = [new CreateApplicationDecisionComponentDto()];

    const result = await service.createOrUpdate(updateDtos, true);

    expect(result).toBeDefined();
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toBeCalledTimes(0);
    expect(mockApplicationDecisionComponentRepository.save).toBeCalledTimes(1);
  });

  it('should not persist entity if persist flag is false', async () => {
    mockApplicationDecisionComponentRepository.findOneOrFail.mockResolvedValue({} as ApplicationDecisionComponent);
    mockApplicationDecisionComponentRepository.save.mockResolvedValue({} as ApplicationDecisionComponent);

    const updateDtos = [new CreateApplicationDecisionComponentDto()];

    const result = await service.createOrUpdate(updateDtos, false);

    expect(result).toBeDefined();
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toBeCalledTimes(0);
    expect(mockApplicationDecisionComponentRepository.save).toBeCalledTimes(0);
  });

  it('should update existing components NFU specific fields when given a DTO with a UUID of NFUP type', async () => {
    mockApplicationDecisionComponentRepository.findOneOrFail.mockResolvedValue({
      uuid: 'fake',
      applicationDecisionComponentTypeCode: APPLICATION_DECISION_COMPONENT_TYPE.NFUP,
    } as ApplicationDecisionComponent);

    const mockDto = new CreateApplicationDecisionComponentDto();
    mockDto.uuid = 'fake';
    mockDto.alrArea = 1;
    mockDto.agCap = '2';
    mockDto.agCapSource = '3';
    mockDto.agCapMap = '4';
    mockDto.agCapConsultant = '5';
    mockDto.applicationDecisionComponentTypeCode = APPLICATION_DECISION_COMPONENT_TYPE.NFUP;
    mockDto.nfuSubType = '7';
    mockDto.nfuType = '8';

    const result = await service.createOrUpdate([mockDto], false);

    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'fake' },
      relations: {
        lots: true,
      },
    });
    expect(result[0].uuid).toEqual(mockDto.uuid);
    expect(result[0].alrArea).toEqual(mockDto.alrArea);
    expect(result[0].agCap).toEqual(mockDto.agCap);
    expect(result[0].agCapSource).toEqual(mockDto.agCapSource);
    expect(result[0].agCapMap).toEqual(mockDto.agCapMap);
    expect(result[0].agCapConsultant).toEqual(mockDto.agCapConsultant);
    expect(result[0].applicationDecisionComponentTypeCode).toEqual(APPLICATION_DECISION_COMPONENT_TYPE.NFUP);
    expect(result[0].nfuSubType).toEqual(mockDto.nfuSubType);
    expect(result[0].nfuType).toEqual(mockDto.nfuType);
  });

  it('should validation decision component fields and throw error if any', async () => {
    const mockComponents = [
      {
        applicationDecisionComponentTypeCode: 'NFUP',
      },
      {
        applicationDecisionComponentTypeCode: 'POFO',
      },
      { applicationDecisionComponentTypeCode: 'ROSO' },
      { applicationDecisionComponentTypeCode: 'PFRS' },
    ] as CreateApplicationDecisionComponentDto[];

    const mockValidationWrapper = () => {
      service.validate(mockComponents, false);
    };

    expect(mockValidationWrapper).toThrow(ServiceValidationException);
  });

  it('should call lot service if there any lots to remove', async () => {
    mockApplicationDecisionComponentRepository.findOneOrFail.mockResolvedValue({
      lots: [new ApplicationDecisionComponentLot({ uuid: 'remove' })],
    } as ApplicationDecisionComponent);
    mockApplicationDecisionComponentRepository.save.mockResolvedValue({} as ApplicationDecisionComponent);
    mockApplicationDecisionComponentLotService.softRemove.mockResolvedValue([]);

    const updateDtos = [
      {
        uuid: 'fake',
        lots: [
          {
            index: 1,
            componentUuid: '2',
            type: null,
            alrArea: null,
            size: null,
          },
        ],
      } as UpdateApplicationDecisionComponentDto,
    ];

    const result = await service.createOrUpdate(updateDtos);

    expect(result).toBeDefined();
    expect(mockApplicationDecisionComponentRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockApplicationDecisionComponentLotService.softRemove).toBeCalledTimes(1);
    expect(mockApplicationDecisionComponentRepository.save).toBeCalledTimes(1);
  });
});
