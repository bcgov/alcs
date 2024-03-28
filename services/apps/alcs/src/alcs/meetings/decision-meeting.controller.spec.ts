import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import {
  initApplicationDecisionMeetingMock,
  initApplicationMockEntity,
  initApplicationReconsiderationMockEntity,
} from '../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationDecisionProfile } from '../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { UserProfile } from '../../common/automapper/user.automapper.profile';
import { EmailService } from '../../providers/email/email.service';
import { ApplicationReconsiderationService } from '../application-decision/application-reconsideration/application-reconsideration.service';
import { ApplicationDecisionMeetingService } from '../application/application-decision-meeting/application-decision-meeting.service';
import { ApplicationService } from '../application/application.service';
import { Board } from '../board/board.entity';
import { PlanningReferralService } from '../planning-review/planning-referral/planning-referral.service';
import { PlanningReviewMeetingService } from '../planning-review/planning-review-meeting/planning-review-meeting.service';
import { DecisionMeetingController } from './decision-meeting.controller';
import {
  CreateApplicationDecisionMeetingDto,
  DecisionMeetingDto,
} from './decision-meeting.dto';

describe('DecisionMeetingController', () => {
  let controller: DecisionMeetingController;
  let mockMeetingService: DeepMocked<ApplicationDecisionMeetingService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let mockEmailService: DeepMocked<EmailService>;
  let mockPlanningReferralService: DeepMocked<PlanningReferralService>;
  let mockPlanningReviewMeetingService: DeepMocked<PlanningReviewMeetingService>;
  let mockApplication;
  let mockMeeting;

  beforeEach(async () => {
    mockMeetingService = createMock();
    mockApplicationService = createMock();
    mockReconsiderationService = createMock();
    mockPlanningReferralService = createMock();
    mockEmailService = createMock();
    mockPlanningReviewMeetingService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [DecisionMeetingController],
      providers: [
        ApplicationProfile,
        UserProfile,
        {
          provide: ApplicationDecisionMeetingService,
          useValue: mockMeetingService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconsiderationService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: PlanningReferralService,
          useValue: mockPlanningReferralService,
        },
        {
          provide: PlanningReviewMeetingService,
          useValue: mockPlanningReviewMeetingService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<DecisionMeetingController>(
      DecisionMeetingController,
    );

    mockApplication = initApplicationMockEntity();
    mockMeeting = initApplicationDecisionMeetingMock(mockApplication);
    mockMeetingService.createOrUpdate.mockResolvedValue(mockMeeting);
    mockMeetingService.getByAppFileNumber.mockResolvedValue([mockMeeting]);
    mockMeetingService.get.mockResolvedValue(mockMeeting);
    mockMeetingService.getUpcomingReconsiderationMeetings.mockResolvedValue([]);
    mockMeetingService.getUpcomingApplicationMeetings.mockResolvedValue([]);
    mockPlanningReviewMeetingService.getUpcomingMeetings.mockResolvedValue([]);
    mockPlanningReferralService.getManyByPlanningReview.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all for application', async () => {
    const result = await controller.getAllForApplication('fake-number');

    expect(mockMeetingService.getByAppFileNumber).toBeCalledTimes(1);
    expect(result[0].uuid).toStrictEqual(mockMeeting.uuid);
  });

  it('should get a specific meeting', async () => {
    const result = await controller.get('fake-uuid');

    expect(mockMeetingService.get).toBeCalledTimes(1);
    expect(result.uuid).toStrictEqual(mockMeeting.uuid);
  });

  it('should delete meeting', async () => {
    mockMeetingService.delete.mockReturnValue({} as any);

    await controller.delete('fake-uuid');

    expect(mockMeetingService.delete).toBeCalledTimes(1);
    expect(mockMeetingService.delete).toBeCalledWith('fake-uuid');
  });

  it('should create meeting', async () => {
    mockApplicationService.getOrFail.mockResolvedValue(mockApplication);
    mockMeetingService.getByAppFileNumber.mockResolvedValue([]);

    const meetingToUpdate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: mockApplication.fileNumber,
    } as CreateApplicationDecisionMeetingDto;

    await controller.create(meetingToUpdate);

    expect(mockMeetingService.createOrUpdate).toBeCalledTimes(1);
    expect(mockMeetingService.createOrUpdate).toBeCalledWith({
      date: new Date(meetingToUpdate.date),
      applicationUuid: mockApplication.uuid,
    });
  });

  it('should update meeting', async () => {
    const meetingToUpdate = {
      uuid: mockMeeting.uuid,
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
    } as DecisionMeetingDto;

    await controller.update(meetingToUpdate);

    expect(mockMeetingService.createOrUpdate).toBeCalledTimes(1);
    expect(mockMeetingService.createOrUpdate).toBeCalledWith({
      uuid: meetingToUpdate.uuid,
      date: new Date(meetingToUpdate.date),
    });
  });

  it('should load and map application meetings', async () => {
    mockApplicationService.getMany.mockResolvedValue([mockApplication]);
    mockReconsiderationService.getMany.mockResolvedValue([]);

    mockApplication.card!.board = {
      code: 'CODE',
    } as Board;
    mockMeetingService.getUpcomingApplicationMeetings.mockResolvedValue([
      {
        uuid: mockApplication.uuid,
        next_meeting: mockMeeting.date.toISOString(),
      },
    ]);

    const res = await controller.getMeetings();

    expect(res.CODE).toBeDefined();
    expect(res.CODE.length).toEqual(1);
    expect(res.CODE[0].meetingDate).toEqual(mockMeeting.date.getTime());
    expect(res.CODE[0].fileNumber).toEqual(mockApplication.fileNumber);
  });

  it('should load and map reconsideration meetings', async () => {
    mockApplicationService.getMany.mockResolvedValue([]);

    const reconMock = initApplicationReconsiderationMockEntity(mockApplication);
    reconMock.card!.board = {
      code: 'CODE',
    } as Board;
    mockReconsiderationService.getMany.mockResolvedValue([reconMock]);
    mockMeetingService.getUpcomingReconsiderationMeetings.mockResolvedValue([
      {
        uuid: reconMock.uuid,
        next_meeting: mockMeeting.date.toISOString(),
      },
    ]);

    const res = await controller.getMeetings();

    expect(res.CODE).toBeDefined();
    expect(res.CODE.length).toEqual(1);
    expect(res.CODE[0].meetingDate).toEqual(mockMeeting.date.getTime());
    expect(res.CODE[0].fileNumber).toEqual(mockApplication.fileNumber);
  });
});
