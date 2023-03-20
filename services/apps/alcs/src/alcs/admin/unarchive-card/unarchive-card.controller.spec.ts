import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { CeoCriterionCode } from '../../decision/application-decision/ceo-criterion/ceo-criterion.entity';
import { UnarchiveCardController } from './unarchive-card.controller';
import { UnarchiveCardService } from './unarchive-card.service';

describe('HolidayController', () => {
  let controller: UnarchiveCardController;
  let mockUnarchiveCardService: DeepMocked<UnarchiveCardService>;

  beforeEach(async () => {
    mockUnarchiveCardService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnarchiveCardController],
      providers: [
        {
          provide: UnarchiveCardService,
          useValue: mockUnarchiveCardService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<UnarchiveCardController>(UnarchiveCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for fetch', async () => {
    mockUnarchiveCardService.fetchByFileId.mockResolvedValue([]);

    const res = await controller.fetch('file');

    expect(mockUnarchiveCardService.fetchByFileId).toHaveBeenCalledTimes(1);
  });
});
