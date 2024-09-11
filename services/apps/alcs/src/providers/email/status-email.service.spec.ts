import { CONFIG_TOKEN, ConfigModule } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { ApplicationDecisionDocument } from '../../alcs/application-decision/application-decision-document/application-decision-document.entity';
import { ApplicationDecisionV2Service } from '../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';
import { ApplicationDecision } from '../../alcs/application-decision/application-decision.entity';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationService } from '../../alcs/application/application.service';
import { PARENT_TYPE } from '../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDecisionDocument } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionV2Service } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecision } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntentSubmissionStatusType } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NOI_SUBMISSION_STATUS } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { Document } from '../../document/document.entity';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../../portal/application-submission/application-submission.service';
import { NoticeOfIntentOwner } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.service';
import { EmailService } from './email.service';
import {
  ApplicationEmailData,
  NoticeOfIntentEmailData,
  StatusEmailService,
} from './status-email.service';

describe('StatusEmailService', () => {
  let service: StatusEmailService;
  let mockLocalGovernmentService: DeepMocked<LocalGovernmentService>;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockNoticeOfIntentSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNoticeOfIntentService: DeepMocked<NoticeOfIntentService>;
  let mockEmailService: DeepMocked<EmailService>;
  let mockApplicationDecisionService: DeepMocked<ApplicationDecisionV2Service>;
  let mockNoticeOfIntentDecisionService: DeepMocked<NoticeOfIntentDecisionV2Service>;

  beforeEach(async () => {
    mockEmailService = createMock();
    mockLocalGovernmentService = createMock();
    mockApplicationSubmissionService = createMock();
    mockApplicationService = createMock();
    mockNoticeOfIntentSubmissionService = createMock();
    mockNoticeOfIntentService = createMock();
    mockApplicationDecisionService = createMock();
    mockNoticeOfIntentDecisionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        StatusEmailService,
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLocalGovernmentService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationSubmissionService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoticeOfIntentSubmissionService,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoticeOfIntentService,
        },
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockApplicationDecisionService,
        },
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockNoticeOfIntentDecisionService,
        },
      ],
    }).compile();

    service = module.get<StatusEmailService>(StatusEmailService);

    mockEmailService.sendEmail.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return submission government if found', async () => {
    const localGovernmentUuid = 'fake-uuid';
    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    const mockApplicationSubmission = new ApplicationSubmission({
      localGovernmentUuid,
    });

    mockLocalGovernmentService.getByUuid.mockResolvedValue(mockGovernment);

    const res = await service.getSubmissionGovernmentOrFail(
      mockApplicationSubmission,
    );

    expect(mockLocalGovernmentService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockLocalGovernmentService.getByUuid).toHaveBeenCalledWith(
      mockApplicationSubmission.localGovernmentUuid,
    );
    expect(res).toStrictEqual(mockGovernment);
  });

  it('should call through services and return application data', async () => {
    const mockSubmission = new ApplicationSubmission();
    mockApplicationSubmissionService.getOrFailByFileNumber.mockResolvedValue(
      mockSubmission,
    );

    const res = await service.getApplicationEmailData('file-number');

    expect(
      mockApplicationSubmissionService.getOrFailByFileNumber,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionService.getOrFailByFileNumber,
    ).toBeCalledWith('file-number');
    expect(res).toStrictEqual({
      applicationSubmission: mockSubmission,
      primaryContact: undefined,
      submissionGovernment: null,
    });
  });

  it('should call through services and return notice of intent data', async () => {
    const res = await service.getNoticeOfIntentEmailData(
      new NoticeOfIntentSubmission(),
    );

    expect(res).toStrictEqual({
      primaryContact: undefined,
      submissionGovernment: null,
    });
  });

  it('should call through services and return application documents', async () => {
    const mockDocument1 = new ApplicationDecisionDocument({
      uuid: 'fake-uuid-1',
      document: new Document({ fileName: 'document-1' }),
    });
    const mockDocument2 = new ApplicationDecisionDocument({
      uuid: 'fake-uuid-2',
      document: new Document({ fileName: 'document-2' }),
    });
    const mockDecision = new ApplicationDecision({
      documents: [mockDocument1, mockDocument2],
    });

    mockApplicationDecisionService.get.mockResolvedValue(mockDecision);

    const res = await service.getApplicationDecisionDocuments('file-number');

    expect(mockApplicationDecisionService.get).toBeCalledTimes(1);

    const baseUrl = config.get('ALCS.BASE_URL');

    expect(res).toStrictEqual([
      {
        name: 'document-1',
        url: `${baseUrl}/public/application/decision/${mockDocument1.uuid}/email`,
      },
      {
        name: 'document-2',
        url: `${baseUrl}/public/application/decision/${mockDocument2.uuid}/email`,
      },
    ]);
  });

  it('should call through services and return notice of intent documents', async () => {
    const mockDocument1 = new NoticeOfIntentDecisionDocument({
      uuid: 'fake-uuid-1',
      document: new Document({ fileName: 'document-1' }),
    });
    const mockDocument2 = new NoticeOfIntentDecisionDocument({
      uuid: 'fake-uuid-2',
      document: new Document({ fileName: 'document-2' }),
    });
    const mockDecision = new NoticeOfIntentDecision({
      documents: [mockDocument1, mockDocument2],
    });

    mockNoticeOfIntentDecisionService.get.mockResolvedValue(mockDecision);

    const res = await service.getNoticeOfIntentDecisionDocuments('uuid');

    expect(mockNoticeOfIntentDecisionService.get).toBeCalledTimes(1);

    const baseUrl = config.get('ALCS.BASE_URL');

    expect(res).toStrictEqual([
      {
        name: 'document-1',
        url: `${baseUrl}/public/notice-of-intent/decision/${mockDocument1.uuid}/email`,
      },
      {
        name: 'document-2',
        url: `${baseUrl}/public/notice-of-intent/decision/${mockDocument2.uuid}/email`,
      },
    ]);
  });

  it('should call through services to set application email template', async () => {
    const mockData: ApplicationEmailData = {
      template: 'test',
      status: SUBMISSION_STATUS.IN_REVIEW_BY_LG,
      applicationSubmission: new ApplicationSubmission({ typeCode: 'TURP' }),
      parentType: 'application' as PARENT_TYPE,
      government: new LocalGovernment({ emails: [] }),
      primaryContact: new ApplicationOwner(),
      ccEmails: [],
    };

    mockApplicationSubmissionService.getStatus.mockResolvedValue(
      new ApplicationSubmissionStatusType(),
    );
    mockApplicationService.fetchApplicationTypes.mockResolvedValue([]);
    mockApplicationService.getUuid.mockResolvedValue('fake-uuid');

    await service.sendApplicationStatusEmail(mockData);

    expect(mockApplicationSubmissionService.getStatus).toBeCalledTimes(1);
    expect(mockApplicationSubmissionService.getStatus).toBeCalledWith(
      mockData.status,
    );
    expect(mockApplicationService.fetchApplicationTypes).toBeCalledTimes(1);
  });

  it('should call through services to set notice of intent email template', async () => {
    const mockData: NoticeOfIntentEmailData = {
      template: 'test',
      status: NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      noticeOfIntentSubmission: new NoticeOfIntentSubmission(),
      parentType: 'notice-of-intent' as PARENT_TYPE,
      government: new LocalGovernment({ emails: [] }),
      primaryContact: new NoticeOfIntentOwner(),
      ccEmails: [],
    };

    mockNoticeOfIntentSubmissionService.getStatus.mockResolvedValue(
      new NoticeOfIntentSubmissionStatusType(),
    );
    mockNoticeOfIntentService.listTypes.mockResolvedValue([]);
    mockNoticeOfIntentService.getUuid.mockResolvedValue('fake-uuid');

    await service.sendNoticeOfIntentStatusEmail(mockData);

    expect(mockNoticeOfIntentSubmissionService.getStatus).toHaveBeenCalledTimes(
      1,
    );
    expect(mockNoticeOfIntentSubmissionService.getStatus).toHaveBeenCalledWith(
      mockData.status,
    );
    expect(mockNoticeOfIntentService.listTypes).toHaveBeenCalledTimes(1);
  });

  it('should add CC emails to the send call', async () => {
    const ccEmails = ['bruce.wayne@fakeemail.com', 'iam.batman@fakeemail.com'];
    const mockData: NoticeOfIntentEmailData = {
      template: 'test',
      status: NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      noticeOfIntentSubmission: new NoticeOfIntentSubmission(),
      parentType: 'notice-of-intent' as PARENT_TYPE,
      government: new LocalGovernment({ emails: [] }),
      primaryContact: new NoticeOfIntentOwner({
        email: 'primary.contact@fakeemail.com',
      }),
      ccEmails,
    };

    mockNoticeOfIntentSubmissionService.getStatus.mockResolvedValue(
      new NoticeOfIntentSubmissionStatusType(),
    );
    mockNoticeOfIntentService.listTypes.mockResolvedValue([]);
    mockNoticeOfIntentService.getUuid.mockResolvedValue('fake-uuid');

    await service.sendNoticeOfIntentStatusEmail(mockData);

    expect(mockNoticeOfIntentSubmissionService.getStatus).toHaveBeenCalledTimes(
      1,
    );
    expect(mockNoticeOfIntentService.listTypes).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        cc: ccEmails,
      }),
    );
  });
});
