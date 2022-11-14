import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Board } from '../../board/board.entity';
import { BoardService } from '../../board/board.service';
import { ReconsiderationProfile } from '../../common/automapper/reconsideration.automapper.profile';
import { initApplicationAmendmentMockEntity } from '../../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationAmendmentController } from './application-amendment.controller';
import {
  ApplicationAmendmentCreateDto,
  ApplicationAmendmentDto,
  ApplicationAmendmentUpdateDto,
} from './application-amendment.dto';
import { ApplicationAmendment } from './application-amendment.entity';
import { ApplicationAmendmentService } from './application-amendment.service';

describe('ApplicationAmendmentController', () => {
  let controller: ApplicationAmendmentController;
  let mockAmendmentService: DeepMocked<ApplicationAmendmentService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockAmendmentService = createMock<ApplicationAmendmentService>();
    mockBoardService = createMock<BoardService>();
    mockAmendmentService.mapToDtos.mockResolvedValue([
      {},
    ] as ApplicationAmendmentDto[]);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationAmendmentController],
      providers: [
        ReconsiderationProfile,
        {
          provide: ApplicationAmendmentService,
          useValue: mockAmendmentService,
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

    controller = module.get<ApplicationAmendmentController>(
      ApplicationAmendmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service delete method on delete', async () => {
    mockAmendmentService.delete.mockResolvedValue([
      {},
    ] as ApplicationAmendment[]);
    await controller.delete('fake');
    expect(mockAmendmentService.delete).toBeCalledTimes(1);
    expect(mockAmendmentService.delete).toBeCalledWith('fake');
  });

  it('should call service get by card method', async () => {
    mockAmendmentService.getByCardUuid.mockResolvedValue(
      {} as ApplicationAmendment,
    );
    await controller.getByCard('fake');
    expect(mockAmendmentService.getByCardUuid).toBeCalledTimes(1);
    expect(mockAmendmentService.getByCardUuid).toBeCalledWith('fake');
  });

  it('should call service update method', async () => {
    const amendment = initApplicationAmendmentMockEntity();
    mockAmendmentService.update.mockResolvedValue(amendment);
    await controller.update('fake', {} as ApplicationAmendmentUpdateDto);
    expect(mockAmendmentService.update).toBeCalledTimes(1);
  });

  it('should call service create method', async () => {
    const amendment = initApplicationAmendmentMockEntity();
    mockAmendmentService.create.mockResolvedValue(amendment);
    mockBoardService.getOneOrFail.mockResolvedValue({} as Board);
    await controller.create({} as ApplicationAmendmentCreateDto);
    expect(mockAmendmentService.create).toBeCalledTimes(1);
  });

  it('should call service getByApplication method', async () => {
    const fakeNumber = 'fake';
    mockAmendmentService.getByApplication.mockResolvedValue([]);
    await controller.getByApplication(fakeNumber);
    expect(mockAmendmentService.getByApplication).toBeCalledTimes(1);
    expect(mockAmendmentService.getByApplication).toBeCalledWith(fakeNumber);
  });

  it('should call service getByBoardCode method', async () => {
    const fakeCode = 'fake';
    mockAmendmentService.getByBoardCode.mockResolvedValue([]);
    await controller.getByBoard(fakeCode);
    expect(mockAmendmentService.getByBoardCode).toBeCalledTimes(1);
    expect(mockAmendmentService.getByBoardCode).toBeCalledWith(fakeCode);
  });
});
