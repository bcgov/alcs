import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../../test/mocks/mockTypes';
import { ComplianceAndEnforcementNoticeController } from './notice.controller';
import { ComplianceAndEnforcementNoticeService } from './notice.service';

describe('ComplianceAndEnforcementController', () => {
  let controller: ComplianceAndEnforcementNoticeController;
  let mockComplianceAndEnforcementNoticeService: DeepMocked<ComplianceAndEnforcementNoticeService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementNoticeService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ComplianceAndEnforcementNoticeController],
      providers: [
        {
          provide: ComplianceAndEnforcementNoticeService,
          useValue: mockComplianceAndEnforcementNoticeService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ComplianceAndEnforcementNoticeController>(ComplianceAndEnforcementNoticeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAll and return notices', async () => {
    const notices = [{ uuid: 'ins-1' }] as any;
    mockComplianceAndEnforcementNoticeService.getAll.mockResolvedValue(notices);

    const result = await controller.getAll();

    expect(result).toBe(notices);
    expect(mockComplianceAndEnforcementNoticeService.getAll).toHaveBeenCalledTimes(1);
    expect(mockComplianceAndEnforcementNoticeService.getAll).toHaveBeenCalledWith({ filterByEntryUuid: undefined });
  });

  it('should call createDraft and return uuid', async () => {
    const dto = { notes: 'test' } as any;
    mockComplianceAndEnforcementNoticeService.createDraft.mockResolvedValue('new-uuid');

    const result = await controller.createDraft(dto);

    expect(result).toEqual({ uuid: 'new-uuid' });
    expect(mockComplianceAndEnforcementNoticeService.createDraft).toHaveBeenCalledWith(dto);
  });

  it('should call update and return updated notice', async () => {
    const dto = { notes: 'updated' } as any;
    const updated = { uuid: 'u-1', notes: 'updated' } as any;
    mockComplianceAndEnforcementNoticeService.update.mockResolvedValue(updated);

    const result = await controller.update('u-1', dto);

    expect(result).toBe(updated);
    expect(mockComplianceAndEnforcementNoticeService.update).toHaveBeenCalledWith('u-1', dto);
  });

  it('should call delete and return uuid', async () => {
    mockComplianceAndEnforcementNoticeService.delete.mockResolvedValue(undefined as any);

    const result = await controller.delete('del-1');

    expect(result).toEqual({ uuid: 'del-1' });
    expect(mockComplianceAndEnforcementNoticeService.delete).toHaveBeenCalledWith('del-1');
  });
});
