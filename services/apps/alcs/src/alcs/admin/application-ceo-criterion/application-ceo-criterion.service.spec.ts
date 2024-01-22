import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationCeoCriterionCode } from '../../application-decision/application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationCeoCriterionService } from './application-ceo-criterion.service';

describe('CeoCriterionService', () => {
  let service: ApplicationCeoCriterionService;
  let mockRepository: DeepMocked<Repository<ApplicationCeoCriterionCode>>;

  const ceoCriterionCode = new ApplicationCeoCriterionCode();

  beforeEach(async () => {
    mockRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationCeoCriterionService,
        {
          provide: getRepositoryToken(ApplicationCeoCriterionCode),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationCeoCriterionService>(
      ApplicationCeoCriterionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully create ceo criterion entry', async () => {
    mockRepository.save.mockResolvedValue(new ApplicationCeoCriterionCode());

    const result = await service.create({
      code: '',
      number: 12,
      description: '',
      label: '',
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should successfully update ceo criterion entry if it exists', async () => {
    mockRepository.save.mockResolvedValue(ceoCriterionCode);
    mockRepository.findOneOrFail.mockResolvedValue(ceoCriterionCode);

    const result = await service.update(ceoCriterionCode.code, {
      code: '',
      number: 12,
      description: '',
      label: '',
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: ceoCriterionCode.code },
    });
    expect(result).toBeDefined();
  });

  it('should successfully fetch ceo criterion', async () => {
    mockRepository.find.mockResolvedValue([ceoCriterionCode]);

    const result = await service.fetch();

    expect(mockRepository.find).toBeCalledTimes(1);

    expect(mockRepository.find).toBeCalledWith({
      order: {
        number: 'ASC',
      },
    });
    expect(result).toBeDefined();
  });
});
