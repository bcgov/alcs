import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from '../../board/board.service';
import { ReconsiderationProfile } from '../../common/automapper/reconsideration.automapper.profile';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationReconsiderationController } from './application-reconsideration.controller';
import { ApplicationReconsiderationService } from './application-reconsideration.service';

describe('ApplicationReconsiderationController', () => {
  let controller: ApplicationReconsiderationController;
  let mockReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockReconsiderationService =
      createMock<ApplicationReconsiderationService>();
    mockBoardService = createMock<BoardService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationReconsiderationController],
      providers: [
        ReconsiderationProfile,
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconsiderationService,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationReconsiderationController>(
      ApplicationReconsiderationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
