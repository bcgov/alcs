import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { initCardMockEntity } from '../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { CardController } from './card.controller';
import { CardUpdateDto } from './card.dto';
import { Card } from './card.entity';
import { CardService } from './card.service';

describe('CardController', () => {
  let controller: CardController;
  let cardService: DeepMocked<CardService>;

  const mockCard = initCardMockEntity();

  beforeEach(async () => {
    cardService = createMock<CardService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        { provide: CardService, useValue: cardService },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<CardController>(CardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should update card if correct status provided', async () => {
    cardService.update.mockResolvedValue({
      ...mockCard,
    } as Card);
    const cardToUpdate = {
      statusCode: 'new-status',
      cardTypeCode: 'APP',
    } as unknown as CardUpdateDto;

    const result = await controller.updateCard(mockCard.uuid, cardToUpdate);

    expect(cardService.update).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCard);
  });
});
