import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Board } from '../../board/board.entity';
import { BoardService } from '../../board/board.service';
import { ReconsiderationProfile } from '../../common/automapper/reconsideration.automapper.profile';
import { initApplicationModificationMockEntity } from '../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationModificationController } from './application-modification.controller';
import {
  ApplicationModificationCreateDto,
  ApplicationModificationDto,
  ApplicationModificationUpdateDto,
} from './application-modification.dto';
import { ApplicationModification } from './application-modification.entity';
import { ApplicationModificationService } from './application-modification.service';

describe('ApplicationModificationController', () => {
  let controller: ApplicationModificationController;
  let mockModificationService: DeepMocked<ApplicationModificationService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockModificationService = createMock<ApplicationModificationService>();
    mockBoardService = createMock<BoardService>();
    mockModificationService.mapToDtos.mockResolvedValue([
      {},
    ] as ApplicationModificationDto[]);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationModificationController],
      providers: [
        ReconsiderationProfile,
        {
          provide: ApplicationModificationService,
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

    controller = module.get<ApplicationModificationController>(
      ApplicationModificationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service delete method on delete', async () => {
    mockModificationService.delete.mockResolvedValue([
      {},
    ] as ApplicationModification[]);
    await controller.delete('fake');
    expect(mockModificationService.delete).toBeCalledTimes(1);
    expect(mockModificationService.delete).toBeCalledWith('fake');
  });

  it('should call service get by card method', async () => {
    mockModificationService.getByCardUuid.mockResolvedValue(
      {} as ApplicationModification,
    );
    await controller.getByCard('fake');
    expect(mockModificationService.getByCardUuid).toBeCalledTimes(1);
    expect(mockModificationService.getByCardUuid).toBeCalledWith('fake');
  });

  it('should call service update method', async () => {
    const modification = initApplicationModificationMockEntity();
    mockModificationService.update.mockResolvedValue(modification);
    await controller.update('fake', {} as ApplicationModificationUpdateDto);
    expect(mockModificationService.update).toBeCalledTimes(1);
  });

  it('should call service create method', async () => {
    const modification = initApplicationModificationMockEntity();
    mockModificationService.create.mockResolvedValue(modification);
    mockBoardService.getOneOrFail.mockResolvedValue({} as Board);
    await controller.create({} as ApplicationModificationCreateDto);
    expect(mockModificationService.create).toBeCalledTimes(1);
  });

  it('should call service getByApplication method', async () => {
    const fakeNumber = 'fake';
    mockModificationService.getByApplication.mockResolvedValue([]);
    await controller.getByApplication(fakeNumber);
    expect(mockModificationService.getByApplication).toBeCalledTimes(1);
    expect(mockModificationService.getByApplication).toBeCalledWith(fakeNumber);
  });

  it('should call service getByBoardCode method', async () => {
    const fakeCode = 'fake';
    mockModificationService.getByBoardCode.mockResolvedValue([]);
    await controller.getByBoard(fakeCode);
    expect(mockModificationService.getByBoardCode).toBeCalledTimes(1);
    expect(mockModificationService.getByBoardCode).toBeCalledWith(fakeCode);
  });
});
