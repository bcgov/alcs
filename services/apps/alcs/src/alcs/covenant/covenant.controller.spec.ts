import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Board } from '../board/board.entity';
import { BoardService } from '../board/board.service';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { CovenantController } from './covenant.controller';
import { Covenant } from './covenant.entity';
import { CovenantService } from './covenant.service';

describe('CovenantController', () => {
  let controller: CovenantController;
  let mockService: DeepMocked<CovenantService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockService = createMock<CovenantService>();
    mockBoardService = createMock<BoardService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CovenantController],
      providers: [
        {
          provide: CovenantService,
          useValue: mockService,
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
    }).compile();

    controller = module.get<CovenantController>(CovenantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call board service then main service for create', async () => {
    mockBoardService.getOneOrFail.mockResolvedValue({} as Board);
    mockService.create.mockResolvedValue({} as Covenant);
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.create({
      applicant: 'fake-applicant',
      localGovernmentUuid: 'local-gov-uuid',
      fileNumber: 'file-number',
      regionCode: 'region-code',
      boardCode: 'fake',
    });

    expect(mockBoardService.getOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockService.create).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for get card', async () => {
    mockService.getByCardUuid.mockResolvedValue({} as Covenant);
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.getByCard('uuid');

    expect(mockService.getByCardUuid).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });
});
