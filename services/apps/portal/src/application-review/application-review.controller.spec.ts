import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { LocalGovernmentService } from '../alcs/local-government/local-government.service';
import { APPLICATION_STATUS } from '../application/application-status/application-status.dto';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { ApplicationReviewProfile } from '../common/automapper/application-review.automapper.profile';
import { User } from '../user/user.entity';
import { ApplicationReviewController } from './application-review.controller';
import { ApplicationReview } from './application-review.entity';
import { ApplicationReviewService } from './application-review.service';

describe('ApplicationReviewController', () => {
  let controller: ApplicationReviewController;
  let mockAppReviewService: DeepMocked<ApplicationReviewService>;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockLGService: DeepMocked<LocalGovernmentService>;

  const mockLG = {
    isFirstNation: false,
    bceidBusinessGuid: '',
    name: '',
    uuid: '',
  };

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppService = createMock();
    mockLGService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationReviewController],
      providers: [
        ApplicationReviewProfile,
        {
          provide: ApplicationReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLGService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationReviewController>(
      ApplicationReviewController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should check users local government and return the file for get', async () => {
    const fileNumber = '124';
    const applicationReview = new ApplicationReview({
      applicationFileNumber: fileNumber,
    });
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.get.mockResolvedValue(applicationReview);

    const res = await controller.get(fileNumber, {
      user: {
        entity: new User({
          bceidBusinessGuid: 'fake-guid',
        }),
      },
    });
    expect(res).toBeDefined();
    expect(res.applicationFileNumber).toEqual(fileNumber);
  });

  it('should throw an exception for get if user is not local government', async () => {
    const fileNumber = '124';
    const applicationReview = new ApplicationReview({
      applicationFileNumber: fileNumber,
    });
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.get.mockResolvedValue(applicationReview);

    const promise = controller.get(fileNumber, {
      user: {
        entity: new User({}),
      },
    });
    await expect(promise).rejects.toMatchObject(
      new NotFoundException('User not part of any local government'),
    );
  });

  it('update the applications status when calling create', async () => {
    const fileNumber = '124';
    const applicationReview = new ApplicationReview({
      applicationFileNumber: fileNumber,
    });
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.startReview.mockResolvedValue(applicationReview);
    mockAppService.getForGovernmentByFileId.mockResolvedValue(
      new Application(),
    );
    mockAppService.updateStatus.mockResolvedValue({} as any);

    await controller.create(fileNumber, {
      user: {
        entity: new User({
          bceidBusinessGuid: 'id',
        }),
      },
    });

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.startReview).toHaveBeenCalledTimes(1);
    expect(mockAppService.getForGovernmentByFileId).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus.mock.calls[0][1]).toEqual(
      APPLICATION_STATUS.IN_REVIEW,
    );
  });

  it('should call through to the service for update', async () => {
    const fileNumber = '124';
    const applicationReview = new ApplicationReview({
      applicationFileNumber: fileNumber,
    });
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.update.mockResolvedValue(applicationReview);

    await controller.update(
      fileNumber,
      {
        user: {
          entity: new User({
            bceidBusinessGuid: 'id',
          }),
        },
      },
      {},
    );

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.update).toHaveBeenCalledTimes(1);
  });
});
