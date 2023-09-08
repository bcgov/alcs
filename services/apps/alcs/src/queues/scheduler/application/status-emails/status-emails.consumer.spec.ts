import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { generateALCDApplicationHtml } from '../../../../../../../templates/emails/decision-released';
import { generateREVAHtml } from '../../../../../../../templates/emails/under-review-by-alc.template';
import { ApplicationSubmissionStatusService } from '../../../../alcs/application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../../../alcs/application/application-submission-status/submission-status.entity';
import { PARENT_TYPE } from '../../../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { ApplicationOwner } from '../../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../../portal/application-submission/application-submission.entity';
import { EmailService } from '../../../../providers/email/email.service';
import { ApplicationSubmissionStatusEmailConsumer } from './status-emails.consumer';

describe('ApplicationSubmissionStatusEmailConsumer', () => {
  let consumer: ApplicationSubmissionStatusEmailConsumer;
  let mockEmailService: DeepMocked<EmailService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;

  beforeEach(async () => {
    mockEmailService = createMock<EmailService>();
    mockApplicationSubmissionStatusService =
      createMock<ApplicationSubmissionStatusService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubmissionStatusEmailConsumer,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
      ],
    }).compile();

    consumer = module.get<ApplicationSubmissionStatusEmailConsumer>(
      ApplicationSubmissionStatusEmailConsumer,
    );

    mockEmailService.sendEmail.mockResolvedValue();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should send email and update submissionToStatus entry of IN_REVIEW_BY_ALC status', async () => {
    const mockSubmission = new ApplicationSubmission({ fileNumber: 'fake' });
    const mockPrimaryContact = new ApplicationOwner();
    const mockLocalGovernment = new LocalGovernment();

    mockApplicationSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails.mockResolvedValue(
      [
        new ApplicationSubmissionToSubmissionStatus({
          submission: mockSubmission,
          statusTypeCode: SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
        }),
      ],
    );
    mockApplicationSubmissionStatusService.saveSubmissionToSubmissionStatus.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );

    mockEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockSubmission,
      primaryContact: mockPrimaryContact,
      submissionGovernment: mockLocalGovernment,
    });
    mockEmailService.sendApplicationStatusEmail.mockResolvedValue();

    await consumer.processSubmissionStatusesAndSendEmails();

    expect(
      mockApplicationSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.saveSubmissionToSubmissionStatus,
    ).toBeCalledTimes(1);

    expect(mockEmailService.getApplicationEmailData).toBeCalledWith('fake');
    expect(mockEmailService.getApplicationEmailData).toBeCalledTimes(1);
    expect(mockEmailService.sendApplicationStatusEmail).toBeCalledTimes(1);
    expect(mockEmailService.sendApplicationStatusEmail).toBeCalledWith({
      applicationSubmission: mockSubmission,
      government: mockLocalGovernment,
      parentType: PARENT_TYPE.APPLICATION,
      primaryContact: mockPrimaryContact,
      ccGovernment: true,
      generateStatusHtml: generateREVAHtml,
      status: SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
    });
  });

  it('should send email and update submissionToStatus entry of ALC_DECISION status', async () => {
    const mockSubmission = new ApplicationSubmission({ fileNumber: 'fake' });
    const mockPrimaryContact = new ApplicationOwner();
    const mockLocalGovernment = new LocalGovernment();

    mockApplicationSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails.mockResolvedValue(
      [
        new ApplicationSubmissionToSubmissionStatus({
          submission: mockSubmission,
          statusTypeCode: SUBMISSION_STATUS.ALC_DECISION,
        }),
      ],
    );
    mockApplicationSubmissionStatusService.saveSubmissionToSubmissionStatus.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );

    mockEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockSubmission,
      primaryContact: mockPrimaryContact,
      submissionGovernment: mockLocalGovernment,
    });
    mockEmailService.sendApplicationStatusEmail.mockResolvedValue();

    await consumer.processSubmissionStatusesAndSendEmails();

    expect(
      mockApplicationSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.saveSubmissionToSubmissionStatus,
    ).toBeCalledTimes(1);

    expect(mockEmailService.getApplicationEmailData).toBeCalledWith('fake');
    expect(mockEmailService.getApplicationEmailData).toBeCalledTimes(1);
    expect(mockEmailService.sendApplicationStatusEmail).toBeCalledTimes(1);
    expect(mockEmailService.sendApplicationStatusEmail).toBeCalledWith({
      applicationSubmission: mockSubmission,
      government: mockLocalGovernment,
      parentType: PARENT_TYPE.APPLICATION,
      primaryContact: mockPrimaryContact,
      ccGovernment: true,
      generateStatusHtml: generateALCDApplicationHtml,
      status: SUBMISSION_STATUS.ALC_DECISION,
    });
  });

  it('should not send email if no primary contact', async () => {
    const mockSubmission = new ApplicationSubmission({ fileNumber: 'fake' });
    const mockLocalGovernment = new LocalGovernment();

    mockApplicationSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails.mockResolvedValue(
      [
        new ApplicationSubmissionToSubmissionStatus({
          submission: mockSubmission,
          statusTypeCode: SUBMISSION_STATUS.ALC_DECISION,
        }),
      ],
    );
    mockApplicationSubmissionStatusService.saveSubmissionToSubmissionStatus.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );

    mockEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockSubmission,
      primaryContact: undefined,
      submissionGovernment: mockLocalGovernment,
    });
    mockEmailService.sendApplicationStatusEmail.mockResolvedValue();

    await consumer.processSubmissionStatusesAndSendEmails();

    expect(
      mockApplicationSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.saveSubmissionToSubmissionStatus,
    ).toBeCalledTimes(0);

    expect(mockEmailService.getApplicationEmailData).toBeCalledWith('fake');
    expect(mockEmailService.getApplicationEmailData).toBeCalledTimes(1);
    expect(mockEmailService.sendApplicationStatusEmail).toBeCalledTimes(0);
  });
});
