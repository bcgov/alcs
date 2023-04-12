import { ConfigModule } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { of } from 'rxjs';
import { Repository } from 'typeorm';
import { EmailStatus } from './email-status.entity';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mockHttpService;
  let mockRepo: DeepMocked<Repository<EmailStatus>>;

  beforeEach(async () => {
    mockHttpService = createMock();
    mockRepo = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        EmailService,
        {
          provide: HttpService,
          useValue: mockHttpService,
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
    mockHttpService.post.mockReturnValueOnce(of({}));

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
    mockHttpService.post.mockReturnValueOnce(of({}));
    mockHttpService.post.mockReturnValueOnce(of({}));

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
});
