import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardService } from '../../card/card.service';
import { CodeService } from '../../code/code.service';
import {
  MockType,
  repositoryMockFactory,
} from '../../common/utils/test-helpers/mockTypes';
import { ApplicationService } from '../application.service';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import { ApplicationReconsiderationService } from './application-reconsideration.service';

describe('ReconsiderationService', () => {
  let reconsiderationRepositoryMock: MockType<
    Repository<ApplicationReconsideration>
  >;
  let service: ApplicationReconsiderationService;
  let mockCodeService: DeepMocked<CodeService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockCardService: DeepMocked<CardService>;

  beforeEach(async () => {
    mockCodeService = createMock<CodeService>();
    mockApplicationService = createMock<ApplicationService>();
    mockCardService = createMock<CardService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationReconsiderationService,
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: CardService,
          useValue: mockCardService,
        },
        {
          provide: getRepositoryToken(ApplicationReconsideration),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    reconsiderationRepositoryMock = module.get(
      getRepositoryToken(ApplicationReconsideration),
    );
    service = module.get<ApplicationReconsiderationService>(
      ApplicationReconsiderationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
