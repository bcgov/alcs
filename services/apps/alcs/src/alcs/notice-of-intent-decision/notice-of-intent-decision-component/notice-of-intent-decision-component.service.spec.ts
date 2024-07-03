import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNoticeOfIntentDecisionComponentDto } from './notice-of-intent-decision-component.dto';
import { NoticeOfIntentDecisionComponent } from './notice-of-intent-decision-component.entity';
import { NoticeOfIntentDecisionComponentService } from './notice-of-intent-decision-component.service';

describe('NoticeOfIntentDecisionComponentService', () => {
  let service: NoticeOfIntentDecisionComponentService;
  let mockDecisionComponentRepository: DeepMocked<
    Repository<NoticeOfIntentDecisionComponent>
  >;

  beforeEach(async () => {
    mockDecisionComponentRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentDecisionComponentService,
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionComponent),
          useValue: mockDecisionComponentRepository,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentDecisionComponentService>(
      NoticeOfIntentDecisionComponentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repo to get one or fails with correct parameters', async () => {
    mockDecisionComponentRepository.findOneOrFail.mockResolvedValue(
      new NoticeOfIntentDecisionComponent(),
    );

    const result = await service.getOneOrFail('fake');

    expect(mockDecisionComponentRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockDecisionComponentRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'fake' },
    });
    expect(result).toBeDefined();
  });

  it('calls componentRepository.softRemove() method and soft removes an array of components', async () => {
    const components = [
      new NoticeOfIntentDecisionComponent(),
      new NoticeOfIntentDecisionComponent(),
    ];

    mockDecisionComponentRepository.softRemove.mockResolvedValue(
      {} as NoticeOfIntentDecisionComponent,
    );

    await service.softRemove(components);

    expect(mockDecisionComponentRepository.softRemove).toHaveBeenCalledWith(
      components,
    );
  });

  it('throws validation error if there are duplicate components', () => {
    const firstComponent = {
      uuid: 'fake',
      noticeOfIntentDecisionComponentTypeCode: 'TURP',
      agCap: '1',
      agCapSource: '1',
      alrArea: 1,
    } as CreateNoticeOfIntentDecisionComponentDto;

    const secondComponent = {
      uuid: 'fake-2',
      noticeOfIntentDecisionComponentTypeCode: 'TURP',
      agCap: '2',
      agCapSource: '2',
      alrArea: 2,
    } as CreateNoticeOfIntentDecisionComponentDto;

    firstComponent.noticeOfIntentDecisionComponentTypeCode = 'fake';
    secondComponent.noticeOfIntentDecisionComponentTypeCode = 'fake';

    const mockComponentsDto = [firstComponent, secondComponent];

    expect(() => {
      return service.validate(mockComponentsDto);
    }).toThrowError(ServiceValidationException);
  });

  it('does not throw if there are no duplicate components', () => {
    const firstComponent = {
      uuid: 'fake',
      noticeOfIntentDecisionComponentTypeCode: 'TURP',
      agCap: '1',
      agCapSource: '1',
      alrArea: 1,
    } as CreateNoticeOfIntentDecisionComponentDto;

    const secondComponent = {
      uuid: 'fake-2',
      noticeOfIntentDecisionComponentTypeCode: 'fake',
      agCap: '2',
      agCapSource: '2',
      alrArea: 2,
    } as CreateNoticeOfIntentDecisionComponentDto;

    const mockComponentsDto = [firstComponent, secondComponent];

    expect(() => {
      return service.validate(mockComponentsDto);
    }).not.toThrowError(ServiceValidationException);
  });

  it('should create new components when given a DTO without a UUID', async () => {
    mockDecisionComponentRepository.findOneOrFail.mockResolvedValue(
      {} as NoticeOfIntentDecisionComponent,
    );

    const updateDtos = [
      new CreateNoticeOfIntentDecisionComponentDto(),
      new CreateNoticeOfIntentDecisionComponentDto(),
    ];

    const result = await service.createOrUpdate(updateDtos, false);

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(mockDecisionComponentRepository.findOneOrFail).toBeCalledTimes(0);
  });

  it('should update existing components when given a DTO with a UUID', async () => {
    mockDecisionComponentRepository.findOneOrFail.mockResolvedValue({
      uuid: 'fake',
      noticeOfIntentDecisionComponentTypeCode: 'fake_code',
    } as NoticeOfIntentDecisionComponent);

    const mockDto = new CreateNoticeOfIntentDecisionComponentDto();
    mockDto.uuid = 'fake';
    mockDto.alrArea = 1;
    mockDto.agCap = '2';
    mockDto.agCapSource = '3';
    mockDto.agCapMap = '4';
    mockDto.agCapConsultant = '5';
    mockDto.noticeOfIntentDecisionComponentTypeCode = 'should_not_beUpdated';

    const result = await service.createOrUpdate([mockDto], false);

    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(mockDecisionComponentRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockDecisionComponentRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'fake' },
    });
    expect(result[0].uuid).toEqual(mockDto.uuid);
    expect(result[0].alrArea).toEqual(mockDto.alrArea);
    expect(result[0].agCap).toEqual(mockDto.agCap);
    expect(result[0].agCapSource).toEqual(mockDto.agCapSource);
    expect(result[0].agCapMap).toEqual(mockDto.agCapMap);
    expect(result[0].agCapConsultant).toEqual(mockDto.agCapConsultant);
    expect(result[0].noticeOfIntentDecisionComponentTypeCode).toEqual(
      'fake_code',
    );
  });

  it('should persist entity if persist flag is true', async () => {
    mockDecisionComponentRepository.findOneOrFail.mockResolvedValue(
      {} as NoticeOfIntentDecisionComponent,
    );
    mockDecisionComponentRepository.save.mockResolvedValue(
      {} as NoticeOfIntentDecisionComponent,
    );

    const updateDtos = [new CreateNoticeOfIntentDecisionComponentDto()];

    const result = await service.createOrUpdate(updateDtos, true);

    expect(result).toBeDefined();
    expect(mockDecisionComponentRepository.findOneOrFail).toBeCalledTimes(0);
    expect(mockDecisionComponentRepository.save).toBeCalledTimes(1);
  });

  it('should not persist entity if persist flag is false', async () => {
    mockDecisionComponentRepository.findOneOrFail.mockResolvedValue(
      {} as NoticeOfIntentDecisionComponent,
    );
    mockDecisionComponentRepository.save.mockResolvedValue(
      {} as NoticeOfIntentDecisionComponent,
    );

    const updateDtos = [new CreateNoticeOfIntentDecisionComponentDto()];

    const result = await service.createOrUpdate(updateDtos, false);

    expect(result).toBeDefined();
    expect(mockDecisionComponentRepository.findOneOrFail).toBeCalledTimes(0);
    expect(mockDecisionComponentRepository.save).toBeCalledTimes(0);
  });

  it('should validation decision component fields and throw error if any', async () => {
    const mockComponents = [
      {
        noticeOfIntentDecisionComponentTypeCode: 'POFO',
      },
      { noticeOfIntentDecisionComponentTypeCode: 'ROSO' },
      { noticeOfIntentDecisionComponentTypeCode: 'PFRS' },
    ] as CreateNoticeOfIntentDecisionComponentDto[];

    const mockValidationWrapper = () => {
      service.validate(mockComponents, false);
    };

    expect(mockValidationWrapper).toThrow(ServiceValidationException);
  });

  it('should throw exception when isInline is true and alrArea is undefined', async () => {
    mockDecisionComponentRepository.findOneOrFail.mockResolvedValue({
      uuid: 'fake',
      noticeOfIntentDecisionComponentTypeCode: 'fake_code',
      alrArea: 1,
    } as NoticeOfIntentDecisionComponent);

    const mockDto = new CreateNoticeOfIntentDecisionComponentDto();
    mockDto.uuid = 'fake';
    mockDto.alrArea = undefined;
    mockDto.isInline = true;
    mockDto.noticeOfIntentDecisionComponentTypeCode = 'should_not_beUpdated';

    try {
      await service.createOrUpdate([mockDto], false);
    } catch(e) {
      expect(e).toBeInstanceOf(ServiceValidationException);
      expect(e.message).toBe('ALR Area Cannot be Empty When Editing Inline.');
    }
  }); 
});
