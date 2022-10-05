import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { CodeService } from '../code/code.service';
import { initCardMockEntity } from '../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { CardStatus } from './card-status/card-status.entity';
import { CardController } from './card.controller';
import { CardUpdateDto } from './card.dto';
import { Card } from './card.entity';
import { CardService } from './card.service';

describe('CardController', () => {
  let controller: CardController;
  let cardService: DeepMocked<CardService>;
  let codeService: DeepMocked<CodeService>;

  const mockCard = initCardMockEntity();

  beforeEach(async () => {
    cardService = createMock<CardService>();
    codeService = createMock<CodeService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        ...mockKeyCloakProviders,
        { provide: CardService, useValue: cardService },
        { provide: CodeService, useValue: codeService },
      ],
    }).compile();

    controller = module.get<CardController>(CardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should update card if correct status provided', async () => {
    codeService.fetchCardStatus.mockResolvedValue({
      code: 'new-status',
      uuid: 'new-fake',
    } as CardStatus);

    cardService.update.mockResolvedValue({
      ...mockCard,
    } as Card);
    const cardToUpdate = {
      statusCode: 'new-status',
      cardTypeCode: 'APP',
    } as unknown as CardUpdateDto;

    const result = await controller.updateCard(mockCard.uuid, cardToUpdate);

    expect(codeService.fetchCardStatus).toHaveBeenCalledTimes(1);
    expect(codeService.fetchCardStatus).toBeCalledWith(cardToUpdate.statusCode);
    expect(cardService.update).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCard);
  });
});
