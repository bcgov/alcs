import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../../test/mocks/mockTypes';
import { ComplianceAndEnforcementOrderController } from './order.controller';
import { ComplianceAndEnforcementOrderService } from './order.service';

describe('ComplianceAndEnforcementController', () => {
  let controller: ComplianceAndEnforcementOrderController;
  let mockComplianceAndEnforcementOrderService: DeepMocked<ComplianceAndEnforcementOrderService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementOrderService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ComplianceAndEnforcementOrderController],
      providers: [
        {
          provide: ComplianceAndEnforcementOrderService,
          useValue: mockComplianceAndEnforcementOrderService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ComplianceAndEnforcementOrderController>(ComplianceAndEnforcementOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAll and return orders', async () => {
    const orders = [{ uuid: 'ins-1' }] as any;
    mockComplianceAndEnforcementOrderService.getAll.mockResolvedValue(orders);

    const result = await controller.getAll();

    expect(result).toBe(orders);
    expect(mockComplianceAndEnforcementOrderService.getAll).toHaveBeenCalledTimes(1);
    expect(mockComplianceAndEnforcementOrderService.getAll).toHaveBeenCalledWith({ filterByEntryUuid: undefined });
  });

  it('should call createDraft and return uuid', async () => {
    const dto = { notes: 'test' } as any;
    mockComplianceAndEnforcementOrderService.createDraft.mockResolvedValue('new-uuid');

    const result = await controller.createDraft(dto);

    expect(result).toEqual({ uuid: 'new-uuid' });
    expect(mockComplianceAndEnforcementOrderService.createDraft).toHaveBeenCalledWith(dto);
  });

  it('should call update and return updated order', async () => {
    const dto = { notes: 'updated' } as any;
    const updated = { uuid: 'u-1', notes: 'updated' } as any;
    mockComplianceAndEnforcementOrderService.update.mockResolvedValue(updated);

    const result = await controller.update('u-1', dto);

    expect(result).toBe(updated);
    expect(mockComplianceAndEnforcementOrderService.update).toHaveBeenCalledWith('u-1', dto);
  });

  it('should call delete and return uuid', async () => {
    mockComplianceAndEnforcementOrderService.delete.mockResolvedValue(undefined as any);

    const result = await controller.delete('del-1');

    expect(result).toEqual({ uuid: 'del-1' });
    expect(mockComplianceAndEnforcementOrderService.delete).toHaveBeenCalledWith('del-1');
  });
});
