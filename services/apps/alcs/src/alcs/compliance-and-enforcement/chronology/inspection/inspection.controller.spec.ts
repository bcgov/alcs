import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../../test/mocks/mockTypes';
import { ComplianceAndEnforcementChronologyInspectionController } from './inspection.controller';
import { ComplianceAndEnforcementChronologyInspectionService } from './inspection.service';

describe('ComplianceAndEnforcementController', () => {
  let controller: ComplianceAndEnforcementChronologyInspectionController;
  let mockComplianceAndEnforcementInspectionService: DeepMocked<ComplianceAndEnforcementChronologyInspectionService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementInspectionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ComplianceAndEnforcementChronologyInspectionController],
      providers: [
        {
          provide: ComplianceAndEnforcementChronologyInspectionService,
          useValue: mockComplianceAndEnforcementInspectionService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ComplianceAndEnforcementChronologyInspectionController>(
      ComplianceAndEnforcementChronologyInspectionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAll and return inspections', async () => {
    const inspections = [{ uuid: 'ins-1' }] as any;
    mockComplianceAndEnforcementInspectionService.getAll.mockResolvedValue(inspections);

    const result = await controller.getAll();

    expect(result).toBe(inspections);
    expect(mockComplianceAndEnforcementInspectionService.getAll).toHaveBeenCalledTimes(1);
    expect(mockComplianceAndEnforcementInspectionService.getAll).toHaveBeenCalledWith({ filterByEntryUuid: undefined });
  });

  it('should call createDraft and return uuid', async () => {
    const dto = { notes: 'test' } as any;
    mockComplianceAndEnforcementInspectionService.createDraft.mockResolvedValue('new-uuid');

    const result = await controller.createDraft(dto);

    expect(result).toEqual({ uuid: 'new-uuid' });
    expect(mockComplianceAndEnforcementInspectionService.createDraft).toHaveBeenCalledWith(dto);
  });

  it('should call update and return updated inspection', async () => {
    const dto = { notes: 'updated' } as any;
    const updated = { uuid: 'u-1', notes: 'updated' } as any;
    mockComplianceAndEnforcementInspectionService.update.mockResolvedValue(updated);

    const result = await controller.update('u-1', dto);

    expect(result).toBe(updated);
    expect(mockComplianceAndEnforcementInspectionService.update).toHaveBeenCalledWith('u-1', dto);
  });

  it('should call delete and return uuid', async () => {
    mockComplianceAndEnforcementInspectionService.delete.mockResolvedValue(undefined as any);

    const result = await controller.delete('del-1');

    expect(result).toEqual({ uuid: 'del-1' });
    expect(mockComplianceAndEnforcementInspectionService.delete).toHaveBeenCalledWith('del-1');
  });

  it('should call reportTemplateData and stream document', async () => {
    const mockUser = { uuid: 'user-1' } as any;
    const mockReq = { user: mockUser } as any;

    const document = { data: Buffer.from('doc-bytes') } as any;
    mockComplianceAndEnforcementInspectionService.reportTemplateData.mockResolvedValue(document);

    const mockResponse: any = {
      type: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.reportTemplateData(mockReq, 'ins-123', mockResponse);

    expect(mockComplianceAndEnforcementInspectionService.reportTemplateData).toHaveBeenCalledWith('ins-123', mockUser);
    expect(mockResponse.type).toHaveBeenCalledWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(mockResponse.send).toHaveBeenCalledWith(document.data);
  });
});
