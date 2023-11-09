import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionConditionType } from '../../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionConditionTypesService } from './application-decision-condition-types.service';

describe('ApplicationDecisionConditionTypesService', () => {
  let service: ApplicationDecisionConditionTypesService;
  let mockRepository: DeepMocked<Repository<ApplicationDecisionConditionType>>;

  const decisionMakerCode = new ApplicationDecisionConditionType();

  beforeEach(async () => {
    mockRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationDecisionConditionTypesService,
        {
          provide: getRepositoryToken(ApplicationDecisionConditionType),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionConditionTypesService>(
      ApplicationDecisionConditionTypesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully create decision maker entry', async () => {
    mockRepository.save.mockResolvedValue(
      new ApplicationDecisionConditionType(),
    );

    const result = await service.create({
      code: '',
      description: '',
      label: '',
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should successfully update decision maker entry if it exists', async () => {
    mockRepository.save.mockResolvedValue(decisionMakerCode);
    mockRepository.findOneOrFail.mockResolvedValue(decisionMakerCode);

    const result = await service.update(decisionMakerCode.code, {
      code: '',
      description: '',
      label: '',
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: decisionMakerCode.code },
    });
    expect(result).toBeDefined();
  });

  it('should successfully fetch decision maker', async () => {
    mockRepository.find.mockResolvedValue([decisionMakerCode]);

    const result = await service.fetch();

    expect(mockRepository.find).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });
});
