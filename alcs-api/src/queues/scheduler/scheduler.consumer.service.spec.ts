import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { ApplicationService } from '../../application/application.service';
import { ConfigModule } from '../../common/config/config.module';
import { initApplicationMockEntity } from '../../common/utils/test-helpers/mockEntities';
import { EmailService } from '../../providers/email/email.service';
import { SchedulerConsumerService } from './scheduler.consumer.service';

describe('SchedulerConsumerService', () => {
  let schedulerConsumerService: SchedulerConsumerService;
  let mockEmailService: DeepMocked<EmailService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationEntity;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();
    mockEmailService = createMock<EmailService>();
    mockApplicationEntity = await initApplicationMockEntity();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        SchedulerConsumerService,
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    schedulerConsumerService = module.get<SchedulerConsumerService>(
      SchedulerConsumerService,
    );

    mockEmailService.sendEmail.mockResolvedValue();
  });

  it('should be defined', () => {
    expect(schedulerConsumerService).toBeDefined();
  });

  it('should send email with application near expiry', async () => {
    mockApplicationService.getApplicationsNearExpiryDates.mockResolvedValue([
      mockApplicationEntity,
    ]);

    const expectedParameterForEmailService = {
      body: `
      <p>Following applications near expiration:</p>
      ${mockApplicationEntity.fileNumber}`,
      to: config.get<string[]>('EMAIL.DEFAULT_ADMINS'),
      subject: 'Applications near expiry',
    };

    await schedulerConsumerService.applicationExpiry();

    expect(
      mockApplicationService.getApplicationsNearExpiryDates,
    ).toBeCalledTimes(1);
    expect(mockEmailService.sendEmail).toBeCalledTimes(1);
    expect(mockEmailService.sendEmail).toBeCalledWith(
      expectedParameterForEmailService,
    );
  });

  it('should not send email if no application near expiry', async () => {
    mockApplicationService.getApplicationsNearExpiryDates.mockResolvedValue([]);

    await schedulerConsumerService.applicationExpiry();

    expect(
      mockApplicationService.getApplicationsNearExpiryDates,
    ).toBeCalledTimes(1);
    expect(mockEmailService.sendEmail).toBeCalledTimes(0);
  });
});
