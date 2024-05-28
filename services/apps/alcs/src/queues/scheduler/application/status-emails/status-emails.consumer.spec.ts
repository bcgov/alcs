import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { generateREVAHtml } from '../../../../../../../templates/emails/under-review-by-alc.template';
import { ApplicationSubmissionStatusService } from '../../../../alcs/application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../../../alcs/application/application-submission-status/submission-status.entity';
import { PARENT_TYPE } from '../../../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { ApplicationOwner } from '../../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../../portal/application-submission/application-submission.entity';
import { StatusEmailService } from '../../../../providers/email/status-email.service';
import { ApplicationSubmissionStatusEmailConsumer } from './status-emails.consumer';

describe('ApplicationSubmissionStatusEmailConsumer', () => {
  let consumer: ApplicationSubmissionStatusEmailConsumer;
  let mockStatusEmailService: DeepMocked<StatusEmailService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;

  beforeEach(async () => {
    mockStatusEmailService = createMock();
    mockApplicationSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubmissionStatusEmailConsumer,
        {
          provide: StatusEmailService,
          useValue: mockStatusEmailService,
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
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should send email and update submissionToStatus entry of IN_REVIEW_BY_ALC status', async () => {
    const mockSubmission = new ApplicationSubmission({
      fileNumber: 'fake',
      submissionStatuses: [
        new ApplicationSubmissionToSubmissionStatus({
          statusTypeCode: SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
          effectiveDate: new Date(),
        }),
      ],
    });
    mockSubmission.populateCurrentStatus();
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

    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockSubmission,
      primaryContact: mockPrimaryContact,
      submissionGovernment: mockLocalGovernment,
    });
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

    await consumer.process();

    expect(
      mockApplicationSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.saveSubmissionToSubmissionStatus,
    ).toHaveBeenCalledTimes(1);

    expect(mockStatusEmailService.getApplicationEmailData).toHaveBeenCalledWith(
      'fake',
    );
    expect(
      mockStatusEmailService.getApplicationEmailData,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledWith({
      applicationSubmission: mockSubmission,
      government: mockLocalGovernment,
      parentType: PARENT_TYPE.APPLICATION,
      primaryContact: mockPrimaryContact,
      ccGovernment: true,
      generateStatusHtml: generateREVAHtml,
      status: SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
      documents: [],
      ccEmails: [],
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

    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockSubmission,
      primaryContact: undefined,
      submissionGovernment: mockLocalGovernment,
    });
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

    await consumer.process();

    expect(
      mockApplicationSubmissionStatusService.getSubmissionToSubmissionStatusForSendingEmails,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.saveSubmissionToSubmissionStatus,
    ).toHaveBeenCalledTimes(0);

    expect(mockStatusEmailService.getApplicationEmailData).toHaveBeenCalledWith(
      'fake',
    );
    expect(
      mockStatusEmailService.getApplicationEmailData,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(0);
  });
});
