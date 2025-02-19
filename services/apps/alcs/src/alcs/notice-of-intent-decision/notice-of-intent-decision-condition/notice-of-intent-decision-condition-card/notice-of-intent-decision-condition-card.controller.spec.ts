import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { NoticeOfIntentDecisionConditionCardController } from './notice-of-intent-decision-condition-card.controller';
import { NoticeOfIntentDecisionConditionCardService } from './notice-of-intent-decision-condition-card.service';
import { NoticeOfIntentModificationService } from '../../notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDecisionV2Service } from '../../notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecisionConditionCard } from './notice-of-intent-decision-condition-card.entity';
import { classes } from 'automapper-classes';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../../test/mocks/mockTypes';
import { AutomapperModule } from 'automapper-nestjs';
import { NoticeOfIntentDecisionProfile } from '../../../../common/automapper/notice-of-intent-decision.automapper.profile';
import {
  CreateNoticeOfIntentDecisionConditionCardDto,
  NoticeOfIntentDecisionConditionCardBoardDto,
  NoticeOfIntentDecisionConditionCardDto,
  UpdateNoticeOfIntentDecisionConditionCardDto,
} from './notice-of-intent-decision-condition-card.dto';

describe('NoticeOfIntentDecisionConditionCardController', () => {
  let controller: NoticeOfIntentDecisionConditionCardController;
  let mockService: DeepMocked<NoticeOfIntentDecisionConditionCardService>;
  let mockModificationService: DeepMocked<NoticeOfIntentModificationService>;
  let mockDecisionService: DeepMocked<NoticeOfIntentDecisionV2Service>;

  beforeEach(async () => {
    mockService = createMock();
    mockModificationService = createMock();
    mockDecisionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentDecisionConditionCardController],
      providers: [
        {
          provide: NoticeOfIntentDecisionConditionCardService,
          useValue: mockService,
        },
        {
          provide: NoticeOfIntentModificationService,
          useValue: mockModificationService,
        },
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockDecisionService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        NoticeOfIntentDecisionProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentDecisionConditionCardController>(
      NoticeOfIntentDecisionConditionCardController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a condition card', async () => {
    const uuid = 'example-uuid';
    const conditionCard = new NoticeOfIntentDecisionConditionCard();
    conditionCard.decision = { uuid: 'decision-uuid' } as any;
    mockService.get.mockResolvedValue(conditionCard);

    const result = await controller.get(uuid);

    expect(mockService.get).toHaveBeenCalledWith(uuid);
    expect(result).toBeInstanceOf(NoticeOfIntentDecisionConditionCardDto);
  });

  it('should create a new condition card', async () => {
    const dto: CreateNoticeOfIntentDecisionConditionCardDto = {
      conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
      decisionUuid: 'decision-uuid',
      cardStatusCode: 'status-code',
    };
    const conditionCard = new NoticeOfIntentDecisionConditionCard();
    conditionCard.decision = { uuid: 'decision-uuid' } as any;
    mockService.create.mockResolvedValue(conditionCard);

    const result = await controller.create(dto);

    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result).toBeInstanceOf(NoticeOfIntentDecisionConditionCardDto);
  });

  it('should update the condition card and return updated card', async () => {
    const uuid = 'example-uuid';
    const dto: UpdateNoticeOfIntentDecisionConditionCardDto = {
      conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
      cardStatusCode: 'updated-status-code',
    };
    const conditionCard = new NoticeOfIntentDecisionConditionCard();
    conditionCard.decision = { uuid: 'decision-uuid' } as any;
    mockService.update.mockResolvedValue(conditionCard);

    const result = await controller.update(uuid, dto);

    expect(mockService.update).toHaveBeenCalledWith(uuid, dto);
    expect(result).toBeInstanceOf(NoticeOfIntentDecisionConditionCardDto);
  });

  it('should return a condition card by board card uuid', async () => {
    const uuid = 'example-uuid';
    const conditionCard = new NoticeOfIntentDecisionConditionCard();
    conditionCard.decision = { uuid: 'decision-uuid', noticeOfIntent: { fileNumber: 'file-number' } } as any;

    mockService.getByBoardCard.mockResolvedValue(conditionCard);
    mockModificationService.getByFileNumber.mockResolvedValue([]);
    mockDecisionService.getDecisionOrder.mockResolvedValue(1);

    const result = await controller.getByCardUuid(uuid);

    expect(mockService.getByBoardCard).toHaveBeenCalledWith(uuid);
    expect(result).toBeInstanceOf(NoticeOfIntentDecisionConditionCardBoardDto);
    expect(result.fileNumber).toEqual('file-number');
  });

  it('should return condition cards by application file number', async () => {
    const fileNumber = 'example-file-number';
    const conditionCard = new NoticeOfIntentDecisionConditionCard();
    conditionCard.decision = { uuid: 'decision-uuid' } as any;
    mockDecisionService.getForDecisionConditionCardsByFileNumber.mockResolvedValue([conditionCard]);

    const result = await controller.getByApplicationFileNumber(fileNumber);

    expect(mockDecisionService.getForDecisionConditionCardsByFileNumber).toHaveBeenCalledWith(fileNumber);
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toBeInstanceOf(NoticeOfIntentDecisionConditionCardDto);
  });
});
