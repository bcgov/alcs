import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecision } from '../../application-decision/application-decision.entity';
import { ApplicationModificationOutcomeType } from '../../application-decision/application-modification/application-modification-outcome-type/application-modification-outcome-type.entity';
import { ApplicationModification } from '../../application-decision/application-modification/application-modification.entity';
import { ApplicationReconsideration } from '../../application-decision/application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationOutcomeType } from '../../application-decision/application-reconsideration/reconsideration-outcome-type/application-reconsideration-outcome-type.entity';
import { ApplicationReconsiderationType } from '../../application-decision/application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { ApplicationMeeting } from '../application-meeting/application-meeting.entity';
import { ApplicationMeetingService } from '../application-meeting/application-meeting.service';
import { ApplicationPaused } from '../application-paused.entity';
import { ApplicationSubmissionStatusService } from '../application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../application-submission-status/submission-status.entity';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationTimelineService } from './application-timeline.service';

describe('ApplicationTimelineService', () => {
  let service: ApplicationTimelineService;
  let mockAppRepo: DeepMocked<Repository<Application>>;
  let mockAppModificationRepo: DeepMocked<Repository<ApplicationModification>>;
  let mockAppReconsiderationRepo: DeepMocked<
    Repository<ApplicationReconsideration>
  >;
  let mockAppDecisionRepo: DeepMocked<Repository<ApplicationDecision>>;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockAppMeetingService: DeepMocked<ApplicationMeetingService>;
  let mockAppStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  const mockSameDate = new Date();

  beforeEach(async () => {
    mockAppRepo = createMock();
    mockAppModificationRepo = createMock();
    mockAppReconsiderationRepo = createMock();
    mockAppDecisionRepo = createMock();
    mockAppService = createMock();
    mockAppMeetingService = createMock();
    mockAppStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Application),
          useValue: mockAppRepo,
        },
        {
          provide: getRepositoryToken(ApplicationReconsideration),
          useValue: mockAppReconsiderationRepo,
        },
        {
          provide: getRepositoryToken(ApplicationModification),
          useValue: mockAppModificationRepo,
        },
        {
          provide: getRepositoryToken(ApplicationDecision),
          useValue: mockAppDecisionRepo,
        },
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationMeetingService,
          useValue: mockAppMeetingService,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockAppStatusService,
        },
        ApplicationTimelineService,
      ],
    }).compile();

    service = module.get<ApplicationTimelineService>(
      ApplicationTimelineService,
    );

    mockAppRepo.findOneOrFail.mockResolvedValue(
      new Application({ decisionDate: mockSameDate, source: 'APPLICANT' }),
    );
    mockAppModificationRepo.find.mockResolvedValue([]);
    mockAppReconsiderationRepo.find.mockResolvedValue([]);
    mockAppDecisionRepo.find.mockResolvedValue([]);
    mockAppMeetingService.getByAppFileNumber.mockResolvedValue([]);
    mockAppStatusService.getStatusesByFileNumber.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return nothing for empty Application', async () => {
    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
  });

  it('should map base Application events in the correct order', async () => {
    const sameDate = new Date();
    mockAppRepo.findOneOrFail.mockResolvedValue(
      new Application({
        feePaidDate: sameDate,
        dateAcknowledgedComplete: sameDate,
        notificationSentDate: sameDate,
      }),
    );

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(3);
    expect(res[2].htmlText).toEqual('Fee Received Date');
    expect(res[1].htmlText).toEqual('Acknowledged Complete');
    expect(res[0].htmlText).toEqual(
      "'Ready for Review' Notification Sent to Applicant",
    );
  });

  it('should map decision events in the correct order', async () => {
    const sameDate = new Date();
    mockAppService.mapToDtos.mockResolvedValue([
      {
        activeDays: 6,
      } as any,
    ]);

    mockAppDecisionRepo.find.mockResolvedValue([
      new ApplicationDecision({
        auditDate: new Date(sameDate.getTime() + 1000),
        chairReviewDate: new Date(sameDate.getTime() + 1000),
        date: new Date(mockSameDate.getTime() + 1000),
      }),
      new ApplicationDecision({
        auditDate: sameDate,
        chairReviewDate: sameDate,
        date: sameDate,
      }),
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(6);
    expect(res[5].htmlText).toEqual(
      'Decision #1 Made - Active Days: 6 - <b>Decision Released</b>',
    );
    expect(res[4].htmlText).toEqual('Audited Decision #1');
    expect(res[3].htmlText).toEqual('Chair Reviewed Decision #1');
    expect(res[2].htmlText).toEqual('Decision #2 Made');
    expect(res[1].htmlText).toEqual('Audited Decision #2');
    expect(res[0].htmlText).toEqual('Chair Reviewed Decision #2');
  });

  it('should map reconsideration events in the correct order', async () => {
    const sameDate = new Date();
    mockAppReconsiderationRepo.find.mockResolvedValue([
      new ApplicationReconsideration({
        type: {
          code: '33',
        } as ApplicationReconsiderationType,
        submittedDate: new Date(sameDate.getTime() + 100),
        reviewDate: new Date(sameDate.getTime() + 100),
        reviewOutcome: {
          label: 'CATS',
        } as ApplicationReconsiderationOutcomeType,
      }),
      new ApplicationReconsideration({
        type: {
          code: '33.1',
        } as ApplicationReconsiderationType,
        submittedDate: sameDate,
      }),
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(3);
    expect(res[2].htmlText).toEqual('Reconsideration Request #1 - 33.1');
    expect(res[1].htmlText).toEqual('Reconsideration Requested #2 - 33');
    expect(res[0].htmlText).toEqual(
      'Reconsideration Request Reviewed #2 - CATS',
    );
  });

  it('should map modification events in the correct order', async () => {
    const sameDate = new Date();
    mockAppModificationRepo.find.mockResolvedValue([
      new ApplicationModification({
        isTimeExtension: true,
        submittedDate: new Date(sameDate.getTime() + 100),
        reviewDate: new Date(sameDate.getTime() + 100),
        reviewOutcome: {
          label: 'CATS',
        } as ApplicationModificationOutcomeType,
      }),
      new ApplicationModification({
        isTimeExtension: false,
        submittedDate: sameDate,
      }),
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(3);
    expect(res[2].htmlText).toEqual('Modification Requested #1 - Other');
    expect(res[1].htmlText).toEqual(
      'Modification Requested #2 - Time Extension',
    );
    expect(res[0].htmlText).toEqual('Modification Request Reviewed #2 - CATS');
  });

  it('should map Meeting Events', async () => {
    const sameDate = new Date();
    mockAppMeetingService.getByAppFileNumber.mockResolvedValue([
      new ApplicationMeeting({
        meetingPause: new ApplicationPaused({
          startDate: new Date(sameDate.getTime() + 1000),
          endDate: new Date(sameDate.getTime() + 1000),
        }),
        reportPause: new ApplicationPaused({
          startDate: new Date(sameDate.getTime() + 1000),
          endDate: null,
        }),
        type: {
          label: 'CATS',
        } as any,
      }),
      new ApplicationMeeting({
        meetingPause: new ApplicationPaused({
          startDate: sameDate,
          endDate: sameDate,
        }),
        reportPause: new ApplicationPaused({
          startDate: sameDate,
          endDate: sameDate,
        }),
        type: {
          label: 'CATS',
        } as any,
      }),
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(4);
    expect(res[3].htmlText).toEqual('CATS #1');
    expect(res[2].htmlText).toEqual('CATS #1 Report Sent to Applicant');
    expect(res[1].htmlText).toEqual('CATS #2');
    expect(res[0].htmlText).toEqual('CATS #2 Report Sent to Applicant');
  });

  it('should map Status Events', async () => {
    const sameDate = new Date();
    mockAppStatusService.getStatusesByFileNumber.mockResolvedValue([
      new ApplicationSubmissionToSubmissionStatus({
        statusType: {
          code: SUBMISSION_STATUS.RECEIVED_BY_ALC,
          weight: 2,
        } as any,
        effectiveDate: sameDate,
      }),
      new ApplicationSubmissionToSubmissionStatus({
        statusType: {
          code: SUBMISSION_STATUS.IN_PROGRESS,
          weight: 0,
        } as any,
        effectiveDate: sameDate,
      }),
      new ApplicationSubmissionToSubmissionStatus({
        statusType: {
          code: SUBMISSION_STATUS.SUBMITTED_TO_ALC_INCOMPLETE,
          weight: 1,
        } as any,
        effectiveDate: sameDate,
      }),
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(3);
    expect(res[2].htmlText).toEqual('Created - <strong>In Progress</strong>');
    expect(res[1].htmlText).toEqual(
      'Acknowledged Incomplete - <strong>Submitted to ALC - Incomplete</strong>',
    );
    expect(res[0].htmlText).toEqual(
      'Received All Items - <strong>Received by ALC</strong>',
    );
  });
});
