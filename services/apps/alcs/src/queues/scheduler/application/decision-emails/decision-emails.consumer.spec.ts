import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { template } from '../../../../../../../templates/emails/decision-released/application.template';
import { ApplicationDecisionV2Service } from '../../../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';
import { ApplicationDecision } from '../../../../alcs/application-decision/application-decision.entity';
import { ApplicationSubmissionStatusService } from '../../../../alcs/application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../../../alcs/application/application-submission-status/submission-status.entity';
import { Application } from '../../../../alcs/application/application.entity';
import { PARENT_TYPE } from '../../../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { ApplicationOwner } from '../../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../../portal/application-submission/application-submission.entity';
import { StatusEmailService } from '../../../../providers/email/status-email.service';
import { ApplicationDecisionEmailConsumer } from './decision-emails.consumer';

describe('ApplicationDecisionEmailConsumer', () => {
  let consumer: ApplicationDecisionEmailConsumer;
  let mockStatusEmailService: DeepMocked<StatusEmailService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockApplicationDecisionService: DeepMocked<ApplicationDecisionV2Service>;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));
  });

  beforeEach(async () => {
    mockStatusEmailService = createMock();
    mockApplicationSubmissionStatusService = createMock();
    mockApplicationDecisionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDecisionEmailConsumer,
        {
          provide: StatusEmailService,
          useValue: mockStatusEmailService,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockApplicationDecisionService,
        },
      ],
    }).compile();

    consumer = module.get<ApplicationDecisionEmailConsumer>(
      ApplicationDecisionEmailConsumer,
    );
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should send email and update decision emailSentDate', async () => {
    const mockSubmission = new ApplicationSubmission({
      fileNumber: 'fake',
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.ALC_DECISION,
      }),
    });
    const mockPrimaryContact = new ApplicationOwner();
    const mockLocalGovernment = new LocalGovernment();
    const mockDocuments = [{ name: 'fake-document', url: 'fake-url' }];

    mockApplicationDecisionService.getDecisionsPendingEmail.mockResolvedValue([
      new ApplicationDecision({
        uuid: 'uuid',
        application: new Application({
          fileNumber: mockSubmission.fileNumber,
        }),
      }),
    ]);
    mockApplicationDecisionService.update.mockResolvedValue(
      new ApplicationDecision(),
    );
    mockStatusEmailService.getApplicationDecisionDocuments.mockResolvedValue(
      mockDocuments,
    );
    mockApplicationSubmissionStatusService.getCurrentStatusByFileNumber.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus({
        submission: mockSubmission,
        statusTypeCode: SUBMISSION_STATUS.ALC_DECISION,
      }),
    );
    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockSubmission,
      primaryContact: mockPrimaryContact,
      submissionGovernment: mockLocalGovernment,
    });
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

    await consumer.process();

    expect(
      mockApplicationDecisionService.getDecisionsPendingEmail,
    ).toHaveBeenCalledTimes(1);

    expect(
      mockStatusEmailService.getApplicationEmailData,
    ).toHaveBeenCalledTimes(1);
    expect(mockStatusEmailService.getApplicationEmailData).toHaveBeenCalledWith(
      'fake',
    );
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
      template,
      status: SUBMISSION_STATUS.ALC_DECISION,
      documents: mockDocuments,
    });
    expect(mockApplicationDecisionService.update).toHaveBeenCalledTimes(1);
    expect(mockApplicationDecisionService.update).toHaveBeenCalledWith(
      'uuid',
      {
        emailSent: new Date('2022-01-01'),
        isDraft: false,
      },
      undefined,
      undefined,
    );
  });

  it('should not send email if no primary contact', async () => {
    const mockSubmission = new ApplicationSubmission({
      fileNumber: 'fake',
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.ALC_DECISION,
      }),
    });
    const mockLocalGovernment = new LocalGovernment();
    const mockDocuments = [{ name: 'fake-document', url: 'fake-url' }];

    mockApplicationDecisionService.getDecisionsPendingEmail.mockResolvedValue([
      new ApplicationDecision({
        application: new Application({
          fileNumber: mockSubmission.fileNumber,
        }),
      }),
    ]);
    mockApplicationDecisionService.update.mockResolvedValue(
      new ApplicationDecision(),
    );
    mockStatusEmailService.getApplicationDecisionDocuments.mockResolvedValue(
      mockDocuments,
    );
    mockApplicationSubmissionStatusService.getCurrentStatusByFileNumber.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus({
        submission: mockSubmission,
        statusTypeCode: SUBMISSION_STATUS.ALC_DECISION,
      }),
    );

    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockSubmission,
      primaryContact: undefined,
      submissionGovernment: mockLocalGovernment,
    });
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

    await consumer.process();

    expect(
      mockApplicationSubmissionStatusService.saveSubmissionToSubmissionStatus,
    ).toBeCalledTimes(0);

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
