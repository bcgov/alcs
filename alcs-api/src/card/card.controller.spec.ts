import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { CodeService } from '../code/code.service';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { CardController } from './card.controller';
import { CardService } from './card.service';

describe('CardController', () => {
  let controller: CardController;
  let cardService: DeepMocked<CardService>;
  let codeService: DeepMocked<CodeService>;

  // private codeService: CodeService,

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
});
