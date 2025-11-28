import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import * as config from 'config';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../../../../libs/common/src/exceptions/base.exception';
import { UserService } from '../../user/user.service';
import { ComplianceAndEnforcementValidatorService } from './compliance-and-enforcement-validator.service';
import { ComplianceAndEnforcementProfile } from './compliance-and-enforcement.automapper.profile';
import { ComplianceAndEnforcementDto, UpdateComplianceAndEnforcementDto } from './compliance-and-enforcement.dto';
import { AllegedActivity, ComplianceAndEnforcement, InitialSubmissionType } from './compliance-and-enforcement.entity';
import { ComplianceAndEnforcementService } from './compliance-and-enforcement.service';
import { ComplianceAndEnforcementPropertyService } from './property/property.service';
import { ComplianceAndEnforcementSubmitterProfile } from './submitter/submitter.automapper.profile';
import { ComplianceAndEnforcementSubmitterService } from './submitter/submitter.service';

const mockComplianceAndEnforcement = new ComplianceAndEnforcement({
  uuid: '1',
  fileNumber: '1',
  dateSubmitted: new Date(0),
  dateOpened: new Date(0),
  dateClosed: new Date(0),
  initialSubmissionType: InitialSubmissionType.COMPLAINT,
  allegedContraventionNarrative: 'foo',
  allegedActivity: [AllegedActivity.BREACH_OF_CONDITION],
  intakeNotes: 'bar',
  submitters: [],
});

describe('ComplianceAndEnforcementService', () => {
  let service: ComplianceAndEnforcementService;
  let mockComplianceAndEnforcementRepository: DeepMocked<Repository<ComplianceAndEnforcement>>;
  let mockComplianceAndEnforcementSubmitterService: DeepMocked<ComplianceAndEnforcementSubmitterService>;
  let mockComplianceAndEnforcementSubmitterProfile: DeepMocked<ComplianceAndEnforcementSubmitterProfile>;
  let mockComplianceAndEnforcementPropertyService: DeepMocked<ComplianceAndEnforcementPropertyService>;
  let mockComplianceAndEnforcementValidatorService: DeepMocked<ComplianceAndEnforcementValidatorService>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementRepository = createMock<Repository<ComplianceAndEnforcement>>();
    mockComplianceAndEnforcementSubmitterService = createMock<ComplianceAndEnforcementSubmitterService>();
    mockComplianceAndEnforcementSubmitterProfile = createMock<ComplianceAndEnforcementSubmitterProfile>();
    mockComplianceAndEnforcementPropertyService = createMock<ComplianceAndEnforcementPropertyService>();
    mockComplianceAndEnforcementValidatorService = createMock<ComplianceAndEnforcementValidatorService>();
    mockUserService = createMock<UserService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ComplianceAndEnforcementService,
        ComplianceAndEnforcementProfile,
        {
          provide: ComplianceAndEnforcementSubmitterService,
          useValue: mockComplianceAndEnforcementSubmitterService,
        },
        {
          provide: ComplianceAndEnforcementPropertyService,
          useValue: mockComplianceAndEnforcementPropertyService,
        },
        {
          provide: ComplianceAndEnforcementValidatorService,
          useValue: mockComplianceAndEnforcementValidatorService,
        },
        {
          provide: getRepositoryToken(ComplianceAndEnforcement),
          useValue: mockComplianceAndEnforcementRepository,
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

    service = module.get<ComplianceAndEnforcementService>(ComplianceAndEnforcementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchAll', () => {
    const resultDto: ComplianceAndEnforcementDto = {
      ...mockComplianceAndEnforcement,
      dateSubmitted: 0,
      dateOpened: 0,
      dateClosed: 0,
      submitters: [],
      assignee: undefined,
      chronologyClosedAt: 0,
    };
    it('should return all records', async () => {
      mockComplianceAndEnforcementRepository.find.mockResolvedValue([mockComplianceAndEnforcement]);
      expect(await service.fetchAll()).toEqual([resultDto]);
    });
  });

  describe('fetchByFileNumber', () => {
    it('should return a single record by id', async () => {
      const resultDto: ComplianceAndEnforcementDto = {
        ...mockComplianceAndEnforcement,
        dateSubmitted: 0,
        dateOpened: 0,
        dateClosed: 0,
        submitters: [],
        assignee: undefined,
        chronologyClosedAt: 0,
      };
      mockComplianceAndEnforcementRepository.findOne.mockResolvedValue(mockComplianceAndEnforcement);
      expect(await service.fetchById('1', 'fileNumber')).toEqual(resultDto);
    });
  });

  describe('create', () => {
    it('should create and save a new record', async () => {
      const createDto: UpdateComplianceAndEnforcementDto = {};
      const createEntity = new ComplianceAndEnforcement();
      const resultDto: ComplianceAndEnforcementDto = {
        ...mockComplianceAndEnforcement,
        dateSubmitted: 0,
        dateOpened: 0,
        dateClosed: 0,
        submitters: [],
        assignee: undefined,
        chronologyClosedAt: 0,
      };
      mockComplianceAndEnforcementRepository.save.mockResolvedValue(mockComplianceAndEnforcement);
      expect(await service.create(createDto)).toEqual(resultDto);
      expect(mockComplianceAndEnforcementRepository.save).toHaveBeenCalledWith(createEntity);
    });
  });

  describe('update', () => {
    it('should update and return the updated record', async () => {
      const updateDto: UpdateComplianceAndEnforcementDto = {};
      const updateEntity = new ComplianceAndEnforcement({
        uuid: mockComplianceAndEnforcement.uuid,
        fileNumber: mockComplianceAndEnforcement.fileNumber,
      });
      const resultDto: ComplianceAndEnforcementDto = {
        ...mockComplianceAndEnforcement,
        dateSubmitted: 0,
        dateOpened: 0,
        dateClosed: 0,
        submitters: [],
        assignee: undefined,
        chronologyClosedAt: 0,
      };
      mockComplianceAndEnforcementRepository.save.mockResolvedValue(mockComplianceAndEnforcement);
      mockComplianceAndEnforcementRepository.findOneBy.mockResolvedValue(mockComplianceAndEnforcement);
      expect(await service.update('1', updateDto)).toEqual(resultDto);
      expect(mockComplianceAndEnforcementRepository.save).toHaveBeenCalledWith(updateEntity);
    });
  });

  describe('delete', () => {
    it('should delete a record and return confirmation', async () => {
      const deleteResult = { affected: 1, raw: '' };
      mockComplianceAndEnforcementRepository.delete.mockResolvedValue(deleteResult);
      mockComplianceAndEnforcementRepository.findOneBy.mockResolvedValue(mockComplianceAndEnforcement);
      expect(await service.delete('1')).toEqual(deleteResult);
      expect(mockComplianceAndEnforcementRepository.findOneBy).toHaveBeenCalledWith({ uuid: '1' });
      expect(mockComplianceAndEnforcementRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should raise an error if not found', async () => {
      mockComplianceAndEnforcementRepository.findOneBy.mockResolvedValue(null);
      await expect(service.delete('1')).rejects.toThrow(ServiceNotFoundException);
      expect(mockComplianceAndEnforcementRepository.findOneBy).toHaveBeenCalledWith({ uuid: '1' });
    });
  });
});
