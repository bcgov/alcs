import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { InquiryProfile } from '../../common/automapper/inquiry.automapper.profile';
import { Board } from '../board/board.entity';
import { BoardService } from '../board/board.service';
import { InquiryController } from './inquiry.controller';
import { InquiryDto } from './inquiry.dto';
import { Inquiry } from './inquiry.entity';
import { InquiryService } from './inquiry.service';

describe('InquiryController', () => {
  let controller: InquiryController;
  let mockInquiryService: DeepMocked<InquiryService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockInquiryService = createMock();
    mockBoardService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [InquiryController],
      providers: [
        InquiryProfile,
        {
          provide: InquiryService,
          useValue: mockInquiryService,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
      ],
    }).compile();

    controller = module.get<InquiryController>(InquiryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should load the board and call create on the service for create', async () => {
    mockBoardService.getOneOrFail.mockResolvedValue(new Board());
    mockInquiryService.create.mockResolvedValue(new Inquiry());

    const res = await controller.create({
      boardCode: '',
      localGovernmentUuid: '',
      regionCode: '',
      submittedToAlcDate: 0,
      summary: '',
      typeCode: '',
    });

    expect(res).toBeDefined();
    expect(mockBoardService.getOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockInquiryService.create).toHaveBeenCalledTimes(1);
  });

  it('should call through for get by card', async () => {
    const mockUuid = 'uuid';
    mockInquiryService.getByCardUuid.mockResolvedValue(new Inquiry());
    mockInquiryService.mapToDtos.mockResolvedValue([new InquiryDto()]);

    const res = await controller.getByCard(mockUuid);

    expect(res).toBeDefined();
    expect(mockInquiryService.getByCardUuid).toHaveBeenCalledTimes(1);
    expect(mockInquiryService.mapToDtos).toHaveBeenCalledTimes(1);
  });
});
