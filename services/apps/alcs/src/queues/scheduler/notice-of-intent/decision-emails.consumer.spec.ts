import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { generateALCDNoticeOfIntentHtml } from '../../../../../../templates/emails/decision-released';
import { PARENT_TYPE } from '../../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernment } from '../../../alcs/local-government/local-government.entity';
import { NoticeOfIntentDecisionV2Service } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecision } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NOI_SUBMISSION_STATUS } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionService } from '../../../alcs/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentOwner } from '../../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { StatusEmailService } from '../../../providers/email/status-email.service';
import { NoticeOfIntentDecisionEmailsConsumer } from './decision-emails.consumer';

describe('NoticeOfIntentDecisionEmailsConsumer', () => {
  let consumer: NoticeOfIntentDecisionEmailsConsumer;
  let mockStatusEmailService: DeepMocked<StatusEmailService>;
  let mockNOISubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNOIDecisionService: DeepMocked<NoticeOfIntentDecisionV2Service>;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));
  });

  beforeEach(async () => {
    mockStatusEmailService = createMock();
    mockNOISubmissionService = createMock();
    mockNOIDecisionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentDecisionEmailsConsumer,
        {
          provide: StatusEmailService,
          useValue: mockStatusEmailService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNOISubmissionService,
        },
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockNOIDecisionService,
        },
      ],
    }).compile();

    consumer = module.get<NoticeOfIntentDecisionEmailsConsumer>(
      NoticeOfIntentDecisionEmailsConsumer,
    );
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should send email and update decisions emailSent date', async () => {
    const mockSubmission = new NoticeOfIntentSubmission({ fileNumber: 'fake' });
    const mockPrimaryContact = new NoticeOfIntentOwner();
    const mockLocalGovernment = new LocalGovernment();
    const mockDocuments = [{ name: 'fake-document', url: 'fake-url' }];

    mockNOIDecisionService.getDecisionsPendingEmail.mockResolvedValue([
      new NoticeOfIntentDecision({
        uuid: 'uuid',
        noticeOfIntent: new NoticeOfIntent({ fileNumber: 'fake' }),
      }),
    ]);
    mockNOIDecisionService.update.mockResolvedValue(
      new NoticeOfIntentDecision(),
    );
    mockStatusEmailService.getNoticeOfIntentDecisionDocuments.mockResolvedValue(
      mockDocuments,
    );
    mockNOISubmissionService.get.mockResolvedValue(mockSubmission);

    mockStatusEmailService.getNoticeOfIntentEmailData.mockResolvedValue({
      primaryContact: mockPrimaryContact,
      submissionGovernment: mockLocalGovernment,
    });
    mockStatusEmailService.sendNoticeOfIntentStatusEmail.mockResolvedValue();

    await consumer.process();

    expect(mockNOISubmissionService.get).toHaveBeenCalledTimes(1);
    expect(
      mockNOIDecisionService.getDecisionsPendingEmail,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.getNoticeOfIntentDecisionDocuments,
    ).toBeCalledTimes(1);
    expect(
      mockStatusEmailService.getNoticeOfIntentEmailData,
    ).toHaveBeenCalledWith(mockSubmission);
    expect(
      mockStatusEmailService.sendNoticeOfIntentStatusEmail,
    ).toBeCalledTimes(1);
    expect(
      mockStatusEmailService.sendNoticeOfIntentStatusEmail,
    ).toHaveBeenCalledWith({
      noticeOfIntentSubmission: mockSubmission,
      government: mockLocalGovernment,
      parentType: PARENT_TYPE.NOTICE_OF_INTENT,
      primaryContact: mockPrimaryContact,
      ccGovernment: true,
      generateStatusHtml: generateALCDNoticeOfIntentHtml,
      status: NOI_SUBMISSION_STATUS.ALC_DECISION,
      documents: mockDocuments,
    });
    expect(mockNOIDecisionService.update).toHaveBeenCalledTimes(1);
    expect(mockNOIDecisionService.update).toHaveBeenCalledWith(
      'uuid',
      {
        emailSent: new Date('2022-01-01'),
      },
      undefined,
    );
  });

  it('should not send email if no primary contact', async () => {
    const mockSubmission = new NoticeOfIntentSubmission({ fileNumber: 'fake' });
    const mockLocalGovernment = new LocalGovernment();
    const mockDocuments = [{ name: 'fake-document', url: 'fake-url' }];

    mockNOIDecisionService.getDecisionsPendingEmail.mockResolvedValue([
      new NoticeOfIntentDecision({
        noticeOfIntent: new NoticeOfIntent(),
      }),
    ]);
    mockStatusEmailService.getNoticeOfIntentDecisionDocuments.mockResolvedValue(
      mockDocuments,
    );
    mockNOISubmissionService.get.mockResolvedValue(mockSubmission);

    mockStatusEmailService.getNoticeOfIntentEmailData.mockResolvedValue({
      primaryContact: undefined,
      submissionGovernment: mockLocalGovernment,
    });
    mockStatusEmailService.sendNoticeOfIntentStatusEmail.mockResolvedValue();

    await consumer.process();

    expect(mockNOISubmissionService.get).toHaveBeenCalledTimes(1);
    expect(
      mockNOIDecisionService.getDecisionsPendingEmail,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.getNoticeOfIntentDecisionDocuments,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.getNoticeOfIntentEmailData,
    ).toHaveBeenCalledWith(mockSubmission);
    expect(
      mockStatusEmailService.sendNoticeOfIntentStatusEmail,
    ).toHaveBeenCalledTimes(0);
  });
});
