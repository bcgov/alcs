import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { generateALCDNoticeOfIntentHtml } from '../../../../../../templates/emails/decision-released';
import { PARENT_TYPE } from '../../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernment } from '../../../alcs/local-government/local-government.entity';
import { NOI_SUBMISSION_STATUS } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntentSubmissionStatusService } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentOwner } from '../../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { StatusEmailService } from '../../../providers/email/status-email.service';
import { NoticeOfIntentSubmissionStatusEmailConsumer } from './status-emails.consumer';

describe('NoticeOfIntentSubmissionStatusEmailConsumer', () => {
  let consumer: NoticeOfIntentSubmissionStatusEmailConsumer;
  let mockStatusEmailService: DeepMocked<StatusEmailService>;
  let mockNoticeOfIntentSubmissionStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;

  beforeEach(async () => {
    mockStatusEmailService = createMock();
    mockNoticeOfIntentSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentSubmissionStatusEmailConsumer,
        {
          provide: StatusEmailService,
          useValue: mockStatusEmailService,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNoticeOfIntentSubmissionStatusService,
        },
      ],
    }).compile();

    consumer = module.get<NoticeOfIntentSubmissionStatusEmailConsumer>(
      NoticeOfIntentSubmissionStatusEmailConsumer,
    );
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should send email and update submissionToStatus entry of ALC_DECISION status', async () => {
    const mockSubmission = new NoticeOfIntentSubmission({ fileNumber: 'fake' });
    const mockPrimaryContact = new NoticeOfIntentOwner();
    const mockLocalGovernment = new LocalGovernment();

    mockNoticeOfIntentSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails.mockResolvedValue(
      [
        new NoticeOfIntentSubmissionToSubmissionStatus({
          submission: mockSubmission,
          statusTypeCode: NOI_SUBMISSION_STATUS.ALC_DECISION,
        }),
      ],
    );
    mockNoticeOfIntentSubmissionStatusService.saveSubmissionToSubmissionStatus.mockResolvedValue(
      new NoticeOfIntentSubmissionToSubmissionStatus(),
    );

    mockStatusEmailService.getNoticeOfIntentEmailData.mockResolvedValue({
      primaryContact: mockPrimaryContact,
      submissionGovernment: mockLocalGovernment,
    });
    mockStatusEmailService.sendNoticeOfIntentStatusEmail.mockResolvedValue();

    await consumer.processSubmissionStatusesAndSendEmails();

    expect(
      mockNoticeOfIntentSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails,
    ).toBeCalledTimes(1);
    expect(
      mockNoticeOfIntentSubmissionStatusService.saveSubmissionToSubmissionStatus,
    ).toBeCalledTimes(1);

    expect(mockStatusEmailService.getNoticeOfIntentEmailData).toBeCalledWith(
      mockSubmission,
    );
    expect(mockStatusEmailService.getNoticeOfIntentEmailData).toBeCalledTimes(
      1,
    );
    expect(
      mockStatusEmailService.sendNoticeOfIntentStatusEmail,
    ).toBeCalledTimes(1);
    expect(mockStatusEmailService.sendNoticeOfIntentStatusEmail).toBeCalledWith(
      {
        noticeOfIntentSubmission: mockSubmission,
        government: mockLocalGovernment,
        parentType: PARENT_TYPE.NOTICE_OF_INTENT,
        primaryContact: mockPrimaryContact,
        ccGovernment: true,
        generateStatusHtml: generateALCDNoticeOfIntentHtml,
        status: NOI_SUBMISSION_STATUS.ALC_DECISION,
      },
    );
  });

  it('should not send email if no primary contact', async () => {
    const mockSubmission = new NoticeOfIntentSubmission({ fileNumber: 'fake' });
    const mockLocalGovernment = new LocalGovernment();

    mockNoticeOfIntentSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails.mockResolvedValue(
      [
        new NoticeOfIntentSubmissionToSubmissionStatus({
          submission: mockSubmission,
          statusTypeCode: NOI_SUBMISSION_STATUS.ALC_DECISION,
        }),
      ],
    );
    mockNoticeOfIntentSubmissionStatusService.saveSubmissionToSubmissionStatus.mockResolvedValue(
      new NoticeOfIntentSubmissionToSubmissionStatus(),
    );

    mockStatusEmailService.getNoticeOfIntentEmailData.mockResolvedValue({
      primaryContact: undefined,
      submissionGovernment: mockLocalGovernment,
    });
    mockStatusEmailService.sendNoticeOfIntentStatusEmail.mockResolvedValue();

    await consumer.processSubmissionStatusesAndSendEmails();

    expect(
      mockNoticeOfIntentSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails,
    ).toBeCalledTimes(1);
    expect(
      mockNoticeOfIntentSubmissionStatusService.saveSubmissionToSubmissionStatus,
    ).toBeCalledTimes(0);

    expect(mockStatusEmailService.getNoticeOfIntentEmailData).toBeCalledWith(
      mockSubmission,
    );
    expect(mockStatusEmailService.getNoticeOfIntentEmailData).toBeCalledTimes(
      1,
    );
    expect(
      mockStatusEmailService.sendNoticeOfIntentStatusEmail,
    ).toBeCalledTimes(0);
  });
});
