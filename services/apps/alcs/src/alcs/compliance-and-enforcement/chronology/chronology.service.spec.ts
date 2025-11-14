import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { CONFIG_TOKEN } from '@app/common/config/config.module';
import * as config from 'config';
import { ComplianceAndEnforcementChronologyService } from './chronology.service';
import { ComplianceAndEnforcementChronologyProfile } from './chronology.automapper.profile';
import { ComplianceAndEnforcementChronologyEntry } from './chronology.entity';

describe('ComplianceAndEnforcementChronologyService', () => {
  let service: ComplianceAndEnforcementChronologyService;
  let mockComplianceAndEnforcementChronologyRepository: DeepMocked<Repository<ComplianceAndEnforcementChronologyEntry>>;

  beforeEach(async () => {
    mockComplianceAndEnforcementChronologyRepository =
      createMock<Repository<ComplianceAndEnforcementChronologyEntry>>();

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
