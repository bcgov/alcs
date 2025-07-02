import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ClsService } from 'nestjs-cls';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { ComplianceAndEnforcementSubmitterController } from './submitter.controller';
import { ComplianceAndEnforcementSubmitterService } from './submitter.service';
import { ComplianceAndEnforcementSubmitterDto } from './submitter.dto';

describe('ComplianceAndEnforcementController', () => {
  let controller: ComplianceAndEnforcementSubmitterController;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementSubmitterService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ComplianceAndEnforcementSubmitterController],
      providers: [
        {
          provide: ComplianceAndEnforcementSubmitterService,
          useValue: mockComplianceAndEnforcementService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ComplianceAndEnforcementSubmitterController>(ComplianceAndEnforcementSubmitterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const createDto = {
        fileUuid: '1',
      };
      const resultDto: ComplianceAndEnforcementSubmitterDto = {
        uuid: '1',
        dateAdded: 0,
        isAnonymous: false,
        name: 'a',
        email: 'b',
        telephoneNumber: 'c',
        affiliation: 'd',
        additionalContactInformation: 'e',
      };
      mockComplianceAndEnforcementService.create.mockResolvedValue(resultDto);
      expect(await controller.create(createDto)).toEqual(resultDto);
      expect(mockComplianceAndEnforcementService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      const updateDto = {
        dateAdded: 0,
        isAnonymous: false,
        name: 'a',
        email: 'b',
        telephoneNumber: 'c',
        affiliation: 'd',
        additionalContactInformation: 'e',
      };
      const resultDto = {
        uuid: '1',
        dateAdded: 0,
        isAnonymous: false,
        name: 'a',
        email: 'b',
        telephoneNumber: 'c',
        affiliation: 'd',
        additionalContactInformation: 'e',
      };
      mockComplianceAndEnforcementService.update.mockResolvedValue(resultDto);
      expect(await controller.update('1', updateDto)).toEqual(resultDto);
      expect(mockComplianceAndEnforcementService.update).toHaveBeenCalledWith('1', updateDto);
    });
  });
});
