import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ComplianceAndEnforcementController } from './compliance-and-enforcement.controller';
import { ComplianceAndEnforcementDto } from './compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from './compliance-and-enforcement.service';

describe('ComplianceAndEnforcementController', () => {
  let controller: ComplianceAndEnforcementController;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ComplianceAndEnforcementController],
      providers: [
        {
          provide: ComplianceAndEnforcementService,
          useValue: mockComplianceAndEnforcementService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ComplianceAndEnforcementController>(ComplianceAndEnforcementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fetch', () => {
    it('should return all items', async () => {
      const result: ComplianceAndEnforcementDto[] = [
        {
          uuid: '1',
          fileNumber: '1',
          dateSubmitted: 0,
          dateOpened: 0,
          dateClosed: 0,
          initialSubmissionType: null,
          allegedContraventionNarrative: '',
          allegedActivity: [],
          intakeNotes: '',
          chronologyClosedAt: 0,
        },
        {
          uuid: '2',
          fileNumber: '2',
          dateSubmitted: 0,
          dateOpened: 0,
          dateClosed: 0,
          initialSubmissionType: null,
          allegedContraventionNarrative: '',
          allegedActivity: [],
          intakeNotes: '',
          chronologyClosedAt: 0,
        },
      ];
      mockComplianceAndEnforcementService.fetchAll.mockResolvedValue(result);
      expect(await controller.fetchAll()).toEqual(result);
      expect(mockComplianceAndEnforcementService.fetchAll).toHaveBeenCalled();
    });
  });

  describe('fetchByFileNumber', () => {
    it('should return a single item by ID', async () => {
      const result: ComplianceAndEnforcementDto = {
        uuid: '1',
        fileNumber: '1',
        dateSubmitted: 0,
        dateOpened: 0,
        dateClosed: 0,
        initialSubmissionType: null,
        allegedContraventionNarrative: '',
        allegedActivity: [],
        intakeNotes: '',
        chronologyClosedAt: 0,
      };
      mockComplianceAndEnforcementService.fetchById.mockResolvedValue(result);
      expect(await controller.fetchByFileNumber('1', true)).toEqual(result);
      expect(mockComplianceAndEnforcementService.fetchById).toHaveBeenCalledWith('1', 'fileNumber', true, false, false);
    });
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const createDto = {};
      const resultDto: ComplianceAndEnforcementDto = {
        uuid: '1',
        fileNumber: '1',
        dateSubmitted: 0,
        dateOpened: 0,
        dateClosed: 0,
        initialSubmissionType: null,
        allegedContraventionNarrative: '',
        allegedActivity: [],
        intakeNotes: '',
        chronologyClosedAt: 0,
      };
      mockComplianceAndEnforcementService.create.mockResolvedValue(resultDto);
      expect(await controller.create(createDto, true)).toEqual(resultDto);
      expect(mockComplianceAndEnforcementService.create).toHaveBeenCalledWith(createDto, true, false);
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      const updateDto = {
        uuid: '1',
        fileNumber: '1',
        dateSubmitted: 0,
        dateOpened: 0,
        dateClosed: 0,
        initialSubmissionType: null,
        allegedContraventionNarrative: '',
        allegedActivity: [],
        intakeNotes: '',
      };
      const resultDto = {
        uuid: '1',
        fileNumber: '1',
        dateSubmitted: 0,
        dateOpened: 0,
        dateClosed: 0,
        initialSubmissionType: null,
        allegedContraventionNarrative: '',
        allegedActivity: [],
        intakeNotes: '',
        chronologyClosedAt: 0,
      };
      mockComplianceAndEnforcementService.update.mockResolvedValue(resultDto);
      expect(await controller.update('1', updateDto)).toEqual(resultDto);
      expect(mockComplianceAndEnforcementService.update).toHaveBeenCalledWith('1', updateDto, { idType: 'uuid' });
    });
  });

  describe('delete', () => {
    it('should delete an item', async () => {
      const result = { affected: 1, raw: '' };
      mockComplianceAndEnforcementService.delete.mockResolvedValue(result);
      expect(await controller.delete('1')).toEqual(result);
      expect(mockComplianceAndEnforcementService.delete).toHaveBeenCalledWith('1');
    });
  });
});
