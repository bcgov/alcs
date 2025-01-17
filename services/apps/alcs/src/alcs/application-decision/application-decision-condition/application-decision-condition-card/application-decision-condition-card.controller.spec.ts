import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ApplicationDecisionConditionCardController } from './application-decision-condition-card.controller';
import { ApplicationDecisionConditionCardService } from './application-decision-condition-card.service';
import { ApplicationModificationService } from '../../application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../application-reconsideration/application-reconsideration.service';
import { ApplicationDecisionConditionCard } from './application-decision-condition-card.entity';
import {
  ApplicationDecisionConditionCardBoardDto,
  ApplicationDecisionConditionCardDto,
  CreateApplicationDecisionConditionCardDto,
  UpdateApplicationDecisionConditionCardDto,
} from './application-decision-condition-card.dto';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../../test/mocks/mockTypes';
import { ApplicationDecisionProfile } from '../../../../common/automapper/application-decision-v2.automapper.profile';

describe('ApplicationDecisionConditionCardController', () => {
  let controller: ApplicationDecisionConditionCardController;
  let mockService: DeepMocked<ApplicationDecisionConditionCardService>;
  let mockModificationService: DeepMocked<ApplicationModificationService>;
  let mockReconsiderationService: DeepMocked<ApplicationReconsiderationService>;

  beforeEach(async () => {
    mockService = createMock();
    mockModificationService = createMock();
    mockReconsiderationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionConditionCardController],
      providers: [
        {
          provide: ApplicationDecisionConditionCardService,
          useValue: mockService,
        },
        {
          provide: ApplicationModificationService,
          useValue: mockModificationService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconsiderationService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ApplicationDecisionProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationDecisionConditionCardController>(ApplicationDecisionConditionCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a condition card', async () => {
    const uuid = 'example-uuid';
    const conditionCard = new ApplicationDecisionConditionCard();
    conditionCard.decision = { uuid: 'decision-uuid' } as any;
    mockService.get.mockResolvedValue(conditionCard);

    const result = await controller.get(uuid);

    expect(mockService.get).toHaveBeenCalledWith(uuid);
    expect(result).toBeInstanceOf(ApplicationDecisionConditionCardDto);
  });

  it('should create a new condition card', async () => {
    const dto: CreateApplicationDecisionConditionCardDto = {
      conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
      decisionUuid: 'decision-uuid',
      cardStatusCode: 'status-code',
    };
    const conditionCard = new ApplicationDecisionConditionCard();
    conditionCard.decision = { uuid: 'decision-uuid' } as any;
    mockService.create.mockResolvedValue(conditionCard);

    const result = await controller.create(dto);

    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result).toBeInstanceOf(ApplicationDecisionConditionCardDto);
  });

  it('should update the condition card and return updated card', async () => {
    const uuid = 'example-uuid';
    const dto: UpdateApplicationDecisionConditionCardDto = {
      conditionsUuids: ['condition-uuid-1', 'condition-uuid-2'],
      cardStatusCode: 'updated-status-code',
    };
    const conditionCard = new ApplicationDecisionConditionCard();
    conditionCard.decision = { uuid: 'decision-uuid' } as any;
    mockService.update.mockResolvedValue(conditionCard);

    const result = await controller.update(uuid, dto);

    expect(mockService.update).toHaveBeenCalledWith(uuid, dto);
    expect(result).toBeInstanceOf(ApplicationDecisionConditionCardDto);
  });

  it('should return a condition card by board card uuid', async () => {
    const uuid = 'example-uuid';
    const conditionCard = new ApplicationDecisionConditionCard();
    conditionCard.decision = { uuid: 'decision-uuid', application: { fileNumber: 'file-number' } } as any;

    mockService.getByBoardCard.mockResolvedValue(conditionCard);
    mockReconsiderationService.getByApplicationDecisionUuid.mockResolvedValue([]);
    mockModificationService.getByApplicationDecisionUuid.mockResolvedValue([]);

    const result = await controller.getByCardUuid(uuid);

    expect(mockService.getByBoardCard).toHaveBeenCalledWith(uuid);
    expect(result).toBeInstanceOf(ApplicationDecisionConditionCardBoardDto);
    expect(result.fileNumber).toEqual('file-number');
  });
});
