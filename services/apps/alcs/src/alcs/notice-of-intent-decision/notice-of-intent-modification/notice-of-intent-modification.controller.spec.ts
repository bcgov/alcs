import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Board } from '../../board/board.entity';
import { BoardService } from '../../board/board.service';
import { ReconsiderationProfile } from '../../../common/automapper/reconsideration.automapper.profile';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentModificationController } from './notice-of-intent-modification.controller';
import {
  NoticeOfIntentModificationCreateDto,
  NoticeOfIntentModificationDto,
  NoticeOfIntentModificationUpdateDto,
} from './notice-of-intent-modification.dto';
import { NoticeOfIntentModification } from './notice-of-intent-modification.entity';
import { NoticeOfIntentModificationService } from './notice-of-intent-modification.service';

describe('NoticeOfIntentModificationController', () => {
  let controller: NoticeOfIntentModificationController;
  let mockModificationService: DeepMocked<NoticeOfIntentModificationService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockModificationService = createMock<NoticeOfIntentModificationService>();
    mockBoardService = createMock<BoardService>();
    mockModificationService.mapToDtos.mockResolvedValue([
      {},
    ] as NoticeOfIntentModificationDto[]);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentModificationController],
      providers: [
        ReconsiderationProfile,
        {
          provide: NoticeOfIntentModificationService,
          useValue: mockModificationService,
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

    controller = module.get<NoticeOfIntentModificationController>(
      NoticeOfIntentModificationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service delete method on delete', async () => {
    mockModificationService.delete.mockResolvedValue([
      {},
    ] as NoticeOfIntentModification[]);
    await controller.delete('fake');
    expect(mockModificationService.delete).toBeCalledTimes(1);
    expect(mockModificationService.delete).toBeCalledWith('fake');
  });

  it('should call service get by card method', async () => {
    mockModificationService.getByCardUuid.mockResolvedValue(
      {} as NoticeOfIntentModification,
    );
    await controller.getByCard('fake');
    expect(mockModificationService.getByCardUuid).toBeCalledTimes(1);
    expect(mockModificationService.getByCardUuid).toBeCalledWith('fake');
  });

  it('should call service update method', async () => {
    const modification = new NoticeOfIntentModification();
    mockModificationService.update.mockResolvedValue(modification);
    await controller.update('fake', {} as NoticeOfIntentModificationUpdateDto);
    expect(mockModificationService.update).toBeCalledTimes(1);
  });

  it('should call service create method', async () => {
    const modification = new NoticeOfIntentModification();
    mockModificationService.create.mockResolvedValue(modification);
    mockBoardService.getOneOrFail.mockResolvedValue({} as Board);
    await controller.create({} as NoticeOfIntentModificationCreateDto);
    expect(mockModificationService.create).toBeCalledTimes(1);
  });

  it('should call service getByApplication method', async () => {
    const fakeNumber = 'fake';
    mockModificationService.getByFileNumber.mockResolvedValue([]);
    await controller.getByFileNumber(fakeNumber);
    expect(mockModificationService.getByFileNumber).toBeCalledTimes(1);
    expect(mockModificationService.getByFileNumber).toBeCalledWith(fakeNumber);
  });
});
