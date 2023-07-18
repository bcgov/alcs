import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { ApplicationSubmissionProfile } from '../common/automapper/application-submission.automapper.profile';
import { ApplicationSubmissionStatusController } from './application-submission-status.controller';
import { ApplicationSubmissionStatusService } from './application-submission-status.service';
import { ApplicationSubmissionToSubmissionStatus } from './submission-status.entity';

describe('ApplicationSubmissionStatusController', () => {
  let controller: ApplicationSubmissionStatusController;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;

  beforeEach(async () => {
    mockApplicationSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationSubmissionStatusController],
      providers: [
        ApplicationSubmissionProfile,
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
    }).compile();

    controller = module.get<ApplicationSubmissionStatusController>(
      ApplicationSubmissionStatusController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to get statuses by file number', async () => {
    const fakeFileNumber = 'fake';

    mockApplicationSubmissionStatusService.getCurrentStatusesByFileNumber.mockResolvedValue(
      [new ApplicationSubmissionToSubmissionStatus()],
    );

    const result = await controller.getStatusesByFileNumber(fakeFileNumber);

    expect(
      mockApplicationSubmissionStatusService.getCurrentStatusesByFileNumber,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.getCurrentStatusesByFileNumber,
    ).toBeCalledWith(fakeFileNumber);
    expect(result.length).toEqual(1);
    expect(result).toBeDefined();
  });

  it('should call service to get current submission status by file number', async () => {
    const fakeFileNumber = 'fake';

    mockApplicationSubmissionStatusService.getCurrentStatusByFileNumber.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );

    const result = await controller.getCurrentStatusByFileNumber(
      fakeFileNumber,
    );

    expect(
      mockApplicationSubmissionStatusService.getCurrentStatusByFileNumber,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.getCurrentStatusByFileNumber,
    ).toBeCalledWith(fakeFileNumber);
    expect(result).toBeDefined();
  });
});
