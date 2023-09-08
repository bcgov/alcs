import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentDecision } from '../../notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntentModificationOutcomeType } from '../../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification-outcome-type/notice-of-intent-modification-outcome-type.entity';
import { NoticeOfIntentModification } from '../../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.entity';
import { NoticeOfIntentMeetingType } from '../notice-of-intent-meeting/notice-of-intent-meeting-type.entity';
import { NoticeOfIntentMeeting } from '../notice-of-intent-meeting/notice-of-intent-meeting.entity';
import { NoticeOfIntentMeetingService } from '../notice-of-intent-meeting/notice-of-intent-meeting.service';
import { NoticeOfIntent } from '../notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent.service';
import { NoticeOfIntentTimelineService } from './notice-of-intent-timeline.service';
import { NoticeOfIntentSubmissionStatusService } from '../notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NOI_SUBMISSION_STATUS } from '../notice-of-intent-submission-status/notice-of-intent-status.dto';

describe('NoticeOfIntentTimelineService', () => {
  let service: NoticeOfIntentTimelineService;
  let mockNOIRepo: DeepMocked<Repository<NoticeOfIntent>>;
  let mockNOIModificationRepo: DeepMocked<
    Repository<NoticeOfIntentModification>
  >;
  let mockNOIDecisionRepo: DeepMocked<Repository<NoticeOfIntentDecision>>;
  let mockNOIService: DeepMocked<NoticeOfIntentService>;
  let mockNOIMeetingService: DeepMocked<NoticeOfIntentMeetingService>;
  let mockNOIStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;

  beforeEach(async () => {
    mockNOIRepo = createMock();
    mockNOIModificationRepo = createMock();
    mockNOIDecisionRepo = createMock();
    mockNOIService = createMock();
    mockNOIMeetingService = createMock();
    mockNOIStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: mockNOIRepo,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentModification),
          useValue: mockNOIModificationRepo,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentDecision),
          useValue: mockNOIDecisionRepo,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNOIService,
        },
        {
          provide: NoticeOfIntentMeetingService,
          useValue: mockNOIMeetingService,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNOIStatusService,
        },
        NoticeOfIntentTimelineService,
      ],
    }).compile();

    service = module.get<NoticeOfIntentTimelineService>(
      NoticeOfIntentTimelineService,
    );

    mockNOIRepo.findOneOrFail.mockResolvedValue(
      new NoticeOfIntent({
        source: 'APPLICANT',
      }),
    );
    mockNOIDecisionRepo.find.mockResolvedValue([]);
    mockNOIModificationRepo.find.mockResolvedValue([]);
    mockNOIMeetingService.getByFileNumber.mockResolvedValue([]);
    mockNOIService.mapToDtos.mockResolvedValue([]);
    mockNOIStatusService.getCurrentStatusesByFileNumber.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return nothing for empty NOI', async () => {
    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
  });

  it('should map NOI events in the correct order', async () => {
    const sameDate = new Date();
    mockNOIRepo.findOneOrFail.mockResolvedValue(
      new NoticeOfIntent({
        dateReceivedAllItems: sameDate,
        feePaidDate: sameDate,
        dateAcknowledgedComplete: sameDate,
        dateAcknowledgedIncomplete: sameDate,
        dateSubmittedToAlc: sameDate,
      }),
    );

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(2);
    expect(res[0].htmlText).toEqual('Acknowledged Complete');
    expect(res[1].htmlText).toEqual('Fee Received Date');
  });

  it('should map Decision Events', async () => {
    const sameDate = new Date();
    mockNOIDecisionRepo.find.mockResolvedValue([
      new NoticeOfIntentDecision({
        date: new Date(sameDate.getTime() + 1000),
        auditDate: new Date(sameDate.getTime() + 1000),
      }),
      new NoticeOfIntentDecision({
        date: sameDate,
        auditDate: sameDate,
      }),
    ]);
    mockNOIService.mapToDtos.mockResolvedValue([
      {
        activeDays: 5,
      } as any,
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(4);
    expect(res[3].htmlText).toEqual('Decision #1 Made - Active Days: 5');
    expect(res[2].htmlText).toEqual('Audited Decision #1');
    expect(res[1].htmlText).toEqual('Decision #2 Made');
    expect(res[0].htmlText).toEqual('Audited Decision #2');
  });

  it('should map Modification Events', async () => {
    const sameDate = new Date();
    mockNOIModificationRepo.find.mockResolvedValue([
      new NoticeOfIntentModification({
        submittedDate: new Date(sameDate.getTime() + 1000),
        outcomeNotificationDate: new Date(sameDate.getTime() + 1000),
        reviewOutcome: {
          label: 'CATS',
        } as NoticeOfIntentModificationOutcomeType,
      }),
      new NoticeOfIntentModification({
        submittedDate: sameDate,
        outcomeNotificationDate: sameDate,
        reviewOutcome: {
          label: 'CATS',
        } as NoticeOfIntentModificationOutcomeType,
      }),
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(4);
    expect(res[3].htmlText).toEqual('Modification Requested #1');
    expect(res[2].htmlText).toEqual('Modification Request Reviewed #1 - CATS');
    expect(res[1].htmlText).toEqual('Modification Requested #2');
    expect(res[0].htmlText).toEqual('Modification Request Reviewed #2 - CATS');
  });

  it('should map Meeting Events', async () => {
    const sameDate = new Date();
    mockNOIMeetingService.getByFileNumber.mockResolvedValue([
      new NoticeOfIntentMeeting({
        startDate: new Date(sameDate.getTime() + 1000),
        endDate: new Date(sameDate.getTime() + 1000),
        type: {
          label: 'Meeting',
          code: 'CATS',
        } as NoticeOfIntentMeetingType,
      }),
      new NoticeOfIntentMeeting({
        startDate: sameDate,
        endDate: sameDate,
        type: {
          label: 'Meeting',
          code: 'CATS',
        } as NoticeOfIntentMeetingType,
      }),
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(2);
    expect(res[1].htmlText).toEqual('Meeting #1');
    expect(res[0].htmlText).toEqual('Meeting #2');
  });

  it('should map Status Events', async () => {
    const sameDate = new Date();
    mockNOIStatusService.getCurrentStatusesByFileNumber.mockResolvedValue([
      new NoticeOfIntentSubmissionToSubmissionStatus({
        statusType: {
          code: NOI_SUBMISSION_STATUS.RECEIVED_BY_ALC,
          weight: 2,
        } as any,
        effectiveDate: sameDate,
      }),
      new NoticeOfIntentSubmissionToSubmissionStatus({
        statusType: {
          code: NOI_SUBMISSION_STATUS.IN_PROGRESS,
          weight: 0,
        } as any,
        effectiveDate: sameDate,
      }),
      new NoticeOfIntentSubmissionToSubmissionStatus({
        statusType: {
          code: NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC_INCOMPLETE,
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
