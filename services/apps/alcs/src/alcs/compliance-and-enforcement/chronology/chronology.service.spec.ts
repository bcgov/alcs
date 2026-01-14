import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import * as config from 'config';
import { Repository } from 'typeorm';
import { UserService } from '../../../user/user.service';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';
import { ComplianceAndEnforcementService } from '../compliance-and-enforcement.service';
import { ComplianceAndEnforcementChronologyProfile } from './chronology.automapper.profile';
import { ComplianceAndEnforcementChronologyEntry } from './chronology.entity';
import { ComplianceAndEnforcementChronologyService } from './chronology.service';

describe('ComplianceAndEnforcementChronologyService', () => {
  let service: ComplianceAndEnforcementChronologyService;
  let mockComplianceAndEnforcementChronologyRepository: DeepMocked<Repository<ComplianceAndEnforcementChronologyEntry>>;
  let mockComplianceAndEnforcementRepository: DeepMocked<Repository<ComplianceAndEnforcement>>;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementChronologyRepository =
      createMock<Repository<ComplianceAndEnforcementChronologyEntry>>();
    mockComplianceAndEnforcementRepository = createMock<Repository<ComplianceAndEnforcement>>();
    mockComplianceAndEnforcementService = createMock<ComplianceAndEnforcementService>();
    mockUserService = createMock<UserService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ComplianceAndEnforcementChronologyService,
        ComplianceAndEnforcementChronologyProfile,
        {
          provide: getRepositoryToken(ComplianceAndEnforcementChronologyEntry),
          useValue: mockComplianceAndEnforcementChronologyRepository,
        },
        {
          provide: getRepositoryToken(ComplianceAndEnforcement),
          useValue: mockComplianceAndEnforcementRepository,
        },
        {
          provide: ComplianceAndEnforcementService,
          useValue: mockComplianceAndEnforcementService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<ComplianceAndEnforcementChronologyService>(ComplianceAndEnforcementChronologyService);
  });

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(0));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
