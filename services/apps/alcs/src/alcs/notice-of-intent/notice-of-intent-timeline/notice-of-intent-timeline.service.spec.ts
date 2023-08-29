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

describe('NoticeOfIntentTimelineService', () => {
  let service: NoticeOfIntentTimelineService;
  let mockNOIRepo: DeepMocked<Repository<NoticeOfIntent>>;
  let mockNOIModificationRepo: DeepMocked<
    Repository<NoticeOfIntentModification>
  >;
  let mockNOIDecisionRepo: DeepMocked<Repository<NoticeOfIntentDecision>>;
  let mockNOIService: DeepMocked<NoticeOfIntentService>;
  let mockNOIMeetingService: DeepMocked<NoticeOfIntentMeetingService>;

  beforeEach(async () => {
    mockNOIRepo = createMock();
    mockNOIModificationRepo = createMock();
    mockNOIDecisionRepo = createMock();
    mockNOIService = createMock();
    mockNOIMeetingService = createMock();

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
        NoticeOfIntentTimelineService,
      ],
    }).compile();

    service = module.get<NoticeOfIntentTimelineService>(
      NoticeOfIntentTimelineService,
    );

    mockNOIRepo.findOneOrFail.mockResolvedValue(new NoticeOfIntent());
    mockNOIDecisionRepo.find.mockResolvedValue([]);
    mockNOIModificationRepo.find.mockResolvedValue([]);
    mockNOIMeetingService.getByFileNumber.mockResolvedValue([]);
    mockNOIService.mapToDtos.mockResolvedValue([]);
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
    expect(res.length).toEqual(5);
    expect(res[0].htmlText).toEqual('Acknowledged Complete');
    expect(res[1].htmlText).toEqual('Fee Received Date');
    expect(res[2].htmlText).toEqual('Received All Items');
    expect(res[3].htmlText).toEqual('Acknowledged Incomplete');
    expect(res[4].htmlText).toEqual('Submitted to ALC');
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
});
