import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentDecisionConditionType } from '../../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';
import { NoticeofIntentDecisionConditionTypesController } from './notice-of-intent-decision-condition-types.controller';
import { NoticeofIntentDecisionConditionTypesService } from './notice-of-intent-decision-condition-types.service';

describe('NoticeofIntentDecisionConditionTypesController', () => {
  let controller: NoticeofIntentDecisionConditionTypesController;
  let mockDecTypesService: DeepMocked<NoticeofIntentDecisionConditionTypesService>;

  beforeEach(async () => {
    mockDecTypesService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeofIntentDecisionConditionTypesController],
      providers: [
        {
          provide: NoticeofIntentDecisionConditionTypesService,
          useValue: mockDecTypesService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<NoticeofIntentDecisionConditionTypesController>(
      NoticeofIntentDecisionConditionTypesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching decision condition type', async () => {
    mockDecTypesService.fetch.mockResolvedValue([]);

    const noiDecisionConditionTypes = await controller.fetch();

    expect(noiDecisionConditionTypes).toBeDefined();
    expect(mockDecTypesService.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when fetching decision condition type codes', async () => {
    mockDecTypesService.fetchCodes.mockResolvedValue([]);

    const noiDecisionConditionTypeCodes = await controller.fetchCodes();

    expect(noiDecisionConditionTypeCodes).toBeDefined();
    expect(mockDecTypesService.fetchCodes).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when updating decision condition type', async () => {
    mockDecTypesService.update.mockResolvedValue(new NoticeOfIntentDecisionConditionType());

    const noiDecisionConditionType = await controller.update('fake', new NoticeOfIntentDecisionConditionType());

    expect(noiDecisionConditionType).toBeDefined();
    expect(mockDecTypesService.update).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating decision condition type', async () => {
    mockDecTypesService.create.mockResolvedValue(new NoticeOfIntentDecisionConditionType());

    const noiDecisionConditionType = await controller.create(new NoticeOfIntentDecisionConditionType());

    expect(noiDecisionConditionType).toBeDefined();
    expect(mockDecTypesService.create).toHaveBeenCalledTimes(1);
  });
});
