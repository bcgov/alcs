import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionMakerCode } from '../../application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionMakerService } from './application-decision-maker.service';

describe('ApplicationDecisionMakerService', () => {
  let service: ApplicationDecisionMakerService;
  let mockRepository: DeepMocked<Repository<ApplicationDecisionMakerCode>>;

  const decisionMakerCode = new ApplicationDecisionMakerCode();

  beforeEach(async () => {
    mockRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationDecisionMakerService,
        {
          provide: getRepositoryToken(ApplicationDecisionMakerCode),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionMakerService>(
      ApplicationDecisionMakerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully create decision maker entry', async () => {
    mockRepository.save.mockResolvedValue(new ApplicationDecisionMakerCode());

    const result = await service.create({
      code: '',
      isActive: false,
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
      isActive: false,
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
