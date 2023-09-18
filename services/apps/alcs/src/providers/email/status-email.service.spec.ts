import { ConfigModule } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { MJMLParseResults } from 'mjml-core';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationService } from '../../alcs/application/application.service';
import { PARENT_TYPE } from '../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentSubmissionStatusType } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NOI_SUBMISSION_STATUS } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../../portal/application-submission/application-submission.service';
import { NoticeOfIntentOwner } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.service';
import { EmailService } from './email.service';
import { StatusEmailService } from './status-email.service';

describe('StatusEmailService', () => {
  let service: StatusEmailService;
  let mockLocalGovernmentService: DeepMocked<LocalGovernmentService>;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockNoticeOfIntentSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNoticeOfIntentService: DeepMocked<NoticeOfIntentService>;
  let mockEmailService: DeepMocked<EmailService>;

  beforeEach(async () => {
    mockEmailService = createMock();
    mockLocalGovernmentService = createMock();
    mockApplicationSubmissionService = createMock();
    mockApplicationService = createMock();
    mockNoticeOfIntentSubmissionService = createMock();
    mockNoticeOfIntentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        StatusEmailService,
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
      ],
    }).compile();

    service = module.get<StatusEmailService>(StatusEmailService);

    mockEmailService.sendEmail.mockResolvedValue();
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

  it('should call through services to set application email template', async () => {
    const mockData = {
      generateStatusHtml: () => ({} as MJMLParseResults),
      status: SUBMISSION_STATUS.IN_REVIEW_BY_LG,
      applicationSubmission: new ApplicationSubmission({ typeCode: 'TURP' }),
      parentType: 'application' as PARENT_TYPE,
      government: new LocalGovernment({ emails: [] }),
      primaryContact: new ApplicationOwner(),
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
    const mockData = {
      generateStatusHtml: () => ({} as MJMLParseResults),
      status: NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      noticeOfIntentSubmission: new NoticeOfIntentSubmission(),
      parentType: 'notice-of-intent' as PARENT_TYPE,
      government: new LocalGovernment({ emails: [] }),
      primaryContact: new NoticeOfIntentOwner(),
    };

    mockNoticeOfIntentSubmissionService.getStatus.mockResolvedValue(
      new NoticeOfIntentSubmissionStatusType(),
    );
    mockNoticeOfIntentService.listTypes.mockResolvedValue([]);
    mockNoticeOfIntentService.getUuid.mockResolvedValue('fake-uuid');

    await service.sendNoticeOfIntentStatusEmail(mockData);

    expect(mockNoticeOfIntentSubmissionService.getStatus).toBeCalledTimes(1);
    expect(mockNoticeOfIntentSubmissionService.getStatus).toBeCalledWith(
      mockData.status,
    );
    expect(mockNoticeOfIntentService.listTypes).toBeCalledTimes(1);
  });
});
