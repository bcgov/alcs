import { Test, TestingModule } from '@nestjs/testing';
import { IncomingFileController } from './incoming-file.controller';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ApplicationService } from '../application/application.service';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ClsService } from 'nestjs-cls';
import { UserProfile } from '../../common/automapper/user.automapper.profile';
import { ApplicationTimeTrackingService } from '../application/application-time-tracking.service';

describe('IncomingFileController', () => {
  let controller: IncomingFileController;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationTimeTrackingService: DeepMocked<ApplicationTimeTrackingService>;
  let mockPlanningReviewService: DeepMocked<PlanningReviewService>;
  const CODE_ONE = 'CODE_ONE';
  const CODE_TWO = 'CODE_TWO';
  const CODE_THREE = 'CODE_THREE';
  let mockApplications = [
    {
      uuid: 'uuid-1',
      file_number: '1',
      applicant: 'applicant1',
      code: CODE_ONE,
      name: 'gname fname',
      given_name: 'gname',
      family_name: 'fname',
      high_priority: true,
      active_days: 10,
    },
    {
      uuid: 'uuid-2',
      file_number: '2',
      applicant: 'applicant2',
      code: CODE_ONE,
      name: 'gname2 fname2',
      given_name: 'gname2',
      family_name: 'fname2',
      high_priority: false,
      active_days: 20,
    },
  ];
  let mockReconsiderations = [
    {
      uuid: 'uuid-3',
      file_number: '3',
      applicant: 'applicant1',
      code: CODE_TWO,
      name: 'gname fname',
      given_name: 'gname',
      family_name: 'fname',
      high_priority: true,
      active_days: 10,
    },
    {
      uuid: 'uuid-4',
      file_number: '4',
      applicant: 'applicant2',
      code: CODE_TWO,
      name: 'gname2 fname2',
      given_name: 'gname2',
      family_name: 'fname2',
      high_priority: false,
      active_days: 20,
    },
  ];
  let mockPlanningReviews = [
    {
      uuid: 'uuid-5',
      file_number: '5',
      applicant: 'applicant1',
      code: CODE_THREE,
      name: 'gname fname',
      given_name: 'gname',
      family_name: 'fname',
      high_priority: true,
      active_days: 10,
    },
    {
      uuid: 'uuid-6',
      file_number: '6',
      applicant: 'applicant2',
      code: CODE_THREE,
      name: 'gname2 fname2',
      given_name: 'gname2',
      family_name: 'fname2',
      high_priority: false,
      active_days: 20,
    },
  ];

  let mockedApplicationsPausedStatuses: Map<string, boolean> = new Map();
  let mockedReconsPausedStatuses: Map<string, boolean> = new Map();
  let mockedPausedStatuses: Map<string, boolean> = new Map();

  mockedApplicationsPausedStatuses.set('uuid-1', true);
  mockedApplicationsPausedStatuses.set('uuid-2', true);

  mockedReconsPausedStatuses.set('uuid-3', false);
  mockedReconsPausedStatuses.set('uuid-4', false);

  mockedPausedStatuses.set('uuid-1', true);
  mockedPausedStatuses.set('uuid-2', true);
  mockedPausedStatuses.set('uuid-3', true);
  mockedPausedStatuses.set('uuid-4', true);

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockPlanningReviewService = createMock();
    mockApplicationTimeTrackingService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [IncomingFileController],
      providers: [
        UserProfile,
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: PlanningReviewService,
          useValue: mockPlanningReviewService,
        },
        {
          provide: ApplicationTimeTrackingService,
          useValue: mockApplicationTimeTrackingService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<IncomingFileController>(IncomingFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should load and map incoming applications', async () => {
    mockApplicationService.getIncomingApplicationFiles.mockResolvedValue(
      mockApplications,
    );
    mockApplicationService.getIncomingReconsiderationFiles.mockResolvedValue(
      [],
    );
    mockPlanningReviewService.getIncomingPlanningReviewFiles.mockResolvedValue(
      [],
    );

    mockApplicationTimeTrackingService.getPausedStatusByUuid.mockResolvedValue(
      mockedApplicationsPausedStatuses,
    );
    const res = await controller.getIncomingFiles();

    expect(Object.keys(res).length).toEqual(1);
    expect(res.CODE_ONE).toBeDefined();
    expect(res.CODE_ONE.length).toEqual(2);
    expect(res.CODE_ONE[0].highPriority).toEqual(true);
    expect(res.CODE_ONE[1].activeDays).toEqual(20);
    expect(res.CODE_ONE[0].isPaused).toEqual(true);
  });

  it('should load and map incoming reconsiderations', async () => {
    mockApplicationService.getIncomingApplicationFiles.mockResolvedValue([]);
    mockApplicationService.getIncomingReconsiderationFiles.mockResolvedValue(
      mockReconsiderations,
    );
    mockPlanningReviewService.getIncomingPlanningReviewFiles.mockResolvedValue(
      [],
    );

    mockApplicationTimeTrackingService.getPausedStatusByUuid.mockResolvedValue(
      mockedReconsPausedStatuses,
    );
    const res = await controller.getIncomingFiles();

    expect(Object.keys(res).length).toEqual(1);
    expect(res.CODE_TWO).toBeDefined();
    expect(res.CODE_TWO.length).toEqual(2);
    expect(res.CODE_TWO[0].highPriority).toEqual(true);
    expect(res.CODE_TWO[1].activeDays).toEqual(20);
    expect(res.CODE_TWO[0].isPaused).toEqual(false);
  });

  it('should load and map incoming planning reviews', async () => {
    mockApplicationService.getIncomingApplicationFiles.mockResolvedValue([]);
    mockApplicationService.getIncomingReconsiderationFiles.mockResolvedValue(
      [],
    );
    mockPlanningReviewService.getIncomingPlanningReviewFiles.mockResolvedValue(
      mockPlanningReviews,
    );

    mockApplicationTimeTrackingService.getPausedStatusByUuid.mockResolvedValue(
      new Map<string, boolean>(),
    );
    const res = await controller.getIncomingFiles();

    expect(Object.keys(res).length).toEqual(1);
    expect(res.CODE_THREE).toBeDefined();
    expect(res.CODE_THREE.length).toEqual(2);
    expect(res.CODE_THREE[0].highPriority).toEqual(true);
    expect(res.CODE_THREE[1].activeDays).toEqual(20);
    expect(res.CODE_THREE[0].isPaused).toEqual(false);
  });

  it('should load and map applications, reconsiderations, and planning reviews', async () => {
    mockApplicationService.getIncomingApplicationFiles.mockResolvedValue(
      mockApplications,
    );
    mockApplicationService.getIncomingReconsiderationFiles.mockResolvedValue(
      mockReconsiderations,
    );
    mockPlanningReviewService.getIncomingPlanningReviewFiles.mockResolvedValue(
      mockPlanningReviews,
    );

    mockApplicationTimeTrackingService.getPausedStatusByUuid.mockResolvedValue(
      mockedPausedStatuses,
    );
    const res = await controller.getIncomingFiles();

    expect(Object.keys(res).length).toEqual(3);
    expect(res.CODE_ONE).toBeDefined();
    expect(res.CODE_ONE.length).toEqual(2);
    expect(res.CODE_ONE[0].highPriority).toEqual(true);
    expect(res.CODE_ONE[1].activeDays).toEqual(20);
    expect(res.CODE_ONE[0].isPaused).toEqual(true);
    expect(res.CODE_TWO).toBeDefined();
    expect(res.CODE_TWO.length).toEqual(2);
    expect(res.CODE_TWO[0].highPriority).toEqual(true);
    expect(res.CODE_TWO[1].activeDays).toEqual(20);
    expect(res.CODE_TWO[0].isPaused).toEqual(true);
    expect(res.CODE_THREE).toBeDefined();
    expect(res.CODE_THREE.length).toEqual(2);
    expect(res.CODE_THREE[0].highPriority).toEqual(true);
    expect(res.CODE_THREE[1].activeDays).toEqual(20);
    expect(res.CODE_THREE[1].isPaused).toEqual(false);
  });
});
