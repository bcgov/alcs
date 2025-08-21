import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { CONFIG_TOKEN } from '@app/common/config/config.module';
import * as config from 'config';
import { ComplianceAndEnforcementSubmitterService } from './submitter.service';
import { ComplianceAndEnforcementSubmitter } from './submitter.entity';
import { ComplianceAndEnforcementSubmitterProfile } from './submitter.automapper.profile';
import { ComplianceAndEnforcementSubmitterDto, UpdateComplianceAndEnforcementSubmitterDto } from './submitter.dto';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';

const mockComplianceAndEnforcementSubmitter = new ComplianceAndEnforcementSubmitter({
  uuid: '1',
  dateAdded: new Date(0),
  isAnonymous: false,
  name: 'a',
  email: 'b',
  telephoneNumber: 'c',
  affiliation: 'd',
  additionalContactInformation: 'e',
});

describe('ComplianceAndEnforcementSubmitterService', () => {
  let service: ComplianceAndEnforcementSubmitterService;
  let mockComplianceAndEnforcementSubmitterRepository: DeepMocked<Repository<ComplianceAndEnforcementSubmitter>>;

  beforeEach(async () => {
    mockComplianceAndEnforcementSubmitterRepository = createMock<Repository<ComplianceAndEnforcementSubmitter>>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ComplianceAndEnforcementSubmitterService,
        ComplianceAndEnforcementSubmitterProfile,
        {
          provide: getRepositoryToken(ComplianceAndEnforcementSubmitter),
          useValue: mockComplianceAndEnforcementSubmitterRepository,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<ComplianceAndEnforcementSubmitterService>(ComplianceAndEnforcementSubmitterService);
  });

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(0));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new record', async () => {
      const createDto: UpdateComplianceAndEnforcementSubmitterDto = {
        fileUuid: '1',
      };
      const createEntity = new ComplianceAndEnforcementSubmitter({
        dateAdded: new Date(),
        file: new ComplianceAndEnforcement({
          uuid: '1',
        }),
      });
      const resultDto: ComplianceAndEnforcementSubmitterDto = {
        ...mockComplianceAndEnforcementSubmitter,
        dateAdded: 0,
      };
      mockComplianceAndEnforcementSubmitterRepository.save.mockResolvedValue(mockComplianceAndEnforcementSubmitter);
      expect(await service.create(createDto)).toEqual(resultDto);
      expect(mockComplianceAndEnforcementSubmitterRepository.save).toHaveBeenCalledWith(createEntity);
    });
  });

  describe('update', () => {
    it('should update and return the updated record', async () => {
      const updateDto: UpdateComplianceAndEnforcementSubmitterDto = {};
      const updateEntity = new ComplianceAndEnforcementSubmitter({
        uuid: mockComplianceAndEnforcementSubmitter.uuid,
      });
      const resultDto: ComplianceAndEnforcementSubmitterDto = {
        ...mockComplianceAndEnforcementSubmitter,
        dateAdded: 0,
      };
      mockComplianceAndEnforcementSubmitterRepository.save.mockResolvedValue(mockComplianceAndEnforcementSubmitter);
      mockComplianceAndEnforcementSubmitterRepository.findOneBy.mockResolvedValue(
        mockComplianceAndEnforcementSubmitter,
      );
      expect(await service.update('1', updateDto)).toEqual(resultDto);
      expect(mockComplianceAndEnforcementSubmitterRepository.save).toHaveBeenCalledWith(updateEntity);
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
