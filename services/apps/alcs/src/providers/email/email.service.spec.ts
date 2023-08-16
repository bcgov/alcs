import { ConfigModule } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MJMLParseResults } from 'mjml-core';
import * as config from 'config';
import { of } from 'rxjs';
import { Repository } from 'typeorm';
import { EmailStatus } from './email-status.entity';
import { EmailService } from './email.service';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { ApplicationSubmissionService } from '../../portal/application-submission/application-submission.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';

describe('EmailService', () => {
  let service: EmailService;
  let mockHttpService;
  let mockRepo: DeepMocked<Repository<EmailStatus>>;
  let mockLocalGovernmentService: DeepMocked<LocalGovernmentService>;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockHttpService = createMock();
    mockRepo = createMock();
    mockLocalGovernmentService = createMock<LocalGovernmentService>();
    mockApplicationSubmissionService =
      createMock<ApplicationSubmissionService>();
    mockApplicationService = createMock<ApplicationService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        EmailService,
        {
          provide: HttpService,
          useValue: mockHttpService,
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
          provide: getRepositoryToken(EmailStatus),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mockRepo.save.mockResolvedValue({} as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get token and call email service in happy path', async () => {
    mockHttpService.post.mockReturnValueOnce(
      of({
        data: {
          expires_in: 300,
          access_token: 'fake-token',
        },
      }),
    );

    mockHttpService.post.mockReturnValueOnce(
      of({
        data: {
          txId: '',
        },
      }),
    );

    const mockEmail = {
      body: 'body',
      subject: 'subject',
      to: ['email'],
    };
    await service.sendEmail(mockEmail);

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockHttpService.post).toHaveBeenCalledTimes(2);
    const authUrl = mockHttpService.post.mock.calls[0][0];
    expect(authUrl).toEqual(config.get('CHES.TOKEN_URL'));

    const servicePostBody = mockHttpService.post.mock.calls[1][1];
    expect(servicePostBody.subject).toEqual(mockEmail.subject);
    expect(servicePostBody.body).toEqual(mockEmail.body);
    expect(servicePostBody.from).toEqual(config.get('CHES.FROM'));
  });

  it('should re-use the token if its not expired', async () => {
    mockHttpService.post.mockReturnValueOnce(
      of({
        data: {
          expires_in: 300,
          access_token: 'fake-token',
        },
      }),
    );
    mockHttpService.post.mockReturnValue(
      of({
        data: {
          txId: '',
        },
      }),
    );

    const mockEmail = {
      body: 'body',
      subject: 'subject',
      to: ['email'],
    };

    await service.sendEmail(mockEmail);
    await service.sendEmail(mockEmail);

    expect(mockRepo.save).toHaveBeenCalledTimes(2);
    expect(mockHttpService.post).toHaveBeenCalledTimes(3);
  });

  it('should throw an exception if no submission government is found', async () => {
    mockApplicationSubmissionService.getByUuid.mockResolvedValue(null);

    const promise = service.getSubmissionGovernmentOrFail(
      new ApplicationSubmission(),
    );
    await expect(promise).rejects.toMatchObject(
      new Error('Submission local government not found'),
    );
  });

  it('should set email template', async () => {
    const mockData = {
      generateStatusHtml: () => ({} as MJMLParseResults),
      status: SUBMISSION_STATUS.IN_REVIEW_BY_LG,
      applicationSubmission: new ApplicationSubmission({ typeCode: 'TURP' }),
      government: new LocalGovernment({ emails: [] }),
      primaryContact: new ApplicationOwner(),
    };

    mockApplicationSubmissionService.getStatus.mockResolvedValue(
      new ApplicationSubmissionStatusType(),
    );

    mockApplicationService.fetchApplicationTypes.mockResolvedValue([]);

    await service.sendStatusEmail(mockData);

    expect(mockApplicationSubmissionService.getStatus).toBeCalledTimes(1);
    expect(mockApplicationSubmissionService.getStatus).toBeCalledWith(
      mockData.status,
    );
    expect(mockApplicationService.fetchApplicationTypes).toBeCalledTimes(1);

    // TODO: More unit tests here
  });
  it('should send status email to owner', async () => {});
  it('should send status email to government', async () => {});
  it('should cc status email to government', async () => {});
});
