import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { BoardService } from '../../board/board.service';
import { CardService } from '../../card/card.service';
import { BoardManagementController } from './board-management.controller';

describe('BoardManagementController', () => {
  let controller: BoardManagementController;
  let mockCardService: DeepMocked<CardService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockCardService = createMock();
    mockBoardService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardManagementController],
      providers: [
        {
          provide: CardService,
          useValue: mockCardService,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<BoardManagementController>(
      BoardManagementController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
