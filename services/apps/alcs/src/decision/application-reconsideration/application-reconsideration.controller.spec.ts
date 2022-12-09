import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Board } from '../../board/board.entity';
import { BoardService } from '../../board/board.service';
import { ReconsiderationProfile } from '../../common/automapper/reconsideration.automapper.profile';
import { initApplicationReconsiderationMockEntity } from '../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationReconsiderationController } from './application-reconsideration.controller';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import { ApplicationReconsiderationService } from './application-reconsideration.service';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationUpdateDto,
} from './application-reconsideration.dto';

describe('ApplicationReconsiderationController', () => {
  let controller: ApplicationReconsiderationController;
  let mockReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockReconsiderationService =
      createMock<ApplicationReconsiderationService>();
    mockBoardService = createMock<BoardService>();
    mockReconsiderationService.mapToDtos.mockResolvedValue([
      {},
    ] as ApplicationReconsiderationDto[]);

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
        {
          provide: ClsService,
          useValue: {},
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

  it('should call service delete method on delete', async () => {
    mockReconsiderationService.delete.mockResolvedValue([
      {},
    ] as ApplicationReconsideration[]);
    await controller.delete('fake');
    expect(mockReconsiderationService.delete).toBeCalledTimes(1);
    expect(mockReconsiderationService.delete).toBeCalledWith('fake');
  });

  it('should call service get by card method', async () => {
    mockReconsiderationService.getByCardUuid.mockResolvedValue(
      {} as ApplicationReconsideration,
    );
    await controller.getByCard('fake');
    expect(mockReconsiderationService.getByCardUuid).toBeCalledTimes(1);
    expect(mockReconsiderationService.getByCardUuid).toBeCalledWith('fake');
  });

  it('should call service update method', async () => {
    const recon = initApplicationReconsiderationMockEntity();
    mockReconsiderationService.update.mockResolvedValue(recon);
    await controller.update('fake', {} as ApplicationReconsiderationUpdateDto);
    expect(mockReconsiderationService.update).toBeCalledTimes(1);
  });

  it('should call service create method', async () => {
    const recon = initApplicationReconsiderationMockEntity();
    mockReconsiderationService.create.mockResolvedValue(recon);
    mockBoardService.getOneOrFail.mockResolvedValue({} as Board);
    await controller.create({} as ApplicationReconsiderationCreateDto);
    expect(mockReconsiderationService.create).toBeCalledTimes(1);
  });

  it('should call service getByApplication method', async () => {
    const fakeNumber = 'fake';
    mockReconsiderationService.getByApplication.mockResolvedValue([]);
    await controller.getByApplication(fakeNumber);
    expect(mockReconsiderationService.getByApplication).toBeCalledTimes(1);
    expect(mockReconsiderationService.getByApplication).toBeCalledWith(
      fakeNumber,
    );
  });

  it('should call service getCodes method', async () => {
    mockReconsiderationService.getCodes.mockResolvedValue([]);
    await controller.getCodes();
    expect(mockReconsiderationService.getCodes).toBeCalledTimes(1);
  });
});
