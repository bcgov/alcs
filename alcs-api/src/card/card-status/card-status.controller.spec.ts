import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { initCardStatusMockEntity } from '../../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { CardStatusController } from './card-status.controller';
import { CardStatusDto } from './card-status.dto';
import { CardStatusService } from './card-status.service';

describe('CardStatusController', () => {
  let controller: CardStatusController;
  let mockCardStatusService: DeepMocked<CardStatusService>;
  const mockCardStatusEntity = initCardStatusMockEntity();
  const cardStatusDto: CardStatusDto = {
    code: mockCardStatusEntity.code,
    description: mockCardStatusEntity.description,
    label: mockCardStatusEntity.label,
  };

  beforeEach(async () => {
    mockCardStatusService = createMock<CardStatusService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardStatusController],
      providers: [
        {
          provide: CardStatusService,
          useValue: mockCardStatusService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<CardStatusController>(CardStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add', async () => {
    mockCardStatusService.create.mockResolvedValue(mockCardStatusEntity);
    expect(await controller.add(cardStatusDto)).toStrictEqual(cardStatusDto);
  });
});
