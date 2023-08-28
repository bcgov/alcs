import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Board } from '../board/board.entity';
import { BoardService } from '../board/board.service';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { NoticeOfIntentController } from './notice-of-intent.controller';
import { NoticeOfIntent } from './notice-of-intent.entity';
import { NoticeOfIntentService } from './notice-of-intent.service';

describe('NoticeOfIntentController', () => {
  let controller: NoticeOfIntentController;
  let mockService: DeepMocked<NoticeOfIntentService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockService = createMock<NoticeOfIntentService>();
    mockBoardService = createMock<BoardService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentController],
      providers: [
        {
          provide: NoticeOfIntentService,
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

    controller = module.get<NoticeOfIntentController>(NoticeOfIntentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call board service then main service for create', async () => {
    mockBoardService.getOneOrFail.mockResolvedValue({} as Board);
    mockService.create.mockResolvedValue(new NoticeOfIntent());
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.create({
      applicant: 'fake-applicant',
      localGovernmentUuid: 'local-gov-uuid',
      fileNumber: 'file-number',
      regionCode: 'region-code',
      boardCode: 'fake',
      dateSubmittedToAlc: 0,
      typeCode: '',
    });

    expect(mockBoardService.getOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockService.create).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for get', async () => {
    mockService.getByFileNumber.mockResolvedValue(new NoticeOfIntent());
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.get('fileNumber');

    expect(mockService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for search', async () => {
    mockService.searchByFileNumber.mockResolvedValue([new NoticeOfIntent()]);
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.search('fileNumber');

    expect(mockService.searchByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for update', async () => {
    mockService.update.mockResolvedValue(new NoticeOfIntent());
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.update({}, 'fileNumber');

    expect(mockService.update).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for get card', async () => {
    mockService.getByCardUuid.mockResolvedValue(new NoticeOfIntent());
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.getByCard('uuid');

    expect(mockService.getByCardUuid).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for get sub types', async () => {
    mockService.listSubtypes.mockResolvedValue([]);

    await controller.getSubtypes();

    expect(mockService.listSubtypes).toHaveBeenCalledTimes(1);
  });
});
