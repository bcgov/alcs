import { ConfigModule } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { initApplicationMockEntity } from '../../../../../test/mocks/mockEntities';
import { ApplicationService } from '../../../../alcs/application/application.service';
import { EmailService } from '../../../../providers/email/email.service';
import { ApplicationExpiryConsumer } from './application-expiry.consumer';

describe('SchedulerConsumerService', () => {
  let applicationExpiryConsumer: ApplicationExpiryConsumer;
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
        ApplicationExpiryConsumer,
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

    applicationExpiryConsumer = module.get<ApplicationExpiryConsumer>(
      ApplicationExpiryConsumer,
    );

    mockEmailService.sendEmail.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(applicationExpiryConsumer).toBeDefined();
  });

  it('should send email with application near expiry', async () => {
    mockApplicationService.getAllNearExpiryDates.mockResolvedValue([
      mockApplicationEntity,
    ]);

    const expectedParameterForEmailService = {
      body: `
      <p>Following applications near expiration:</p>
      ${mockApplicationEntity.fileNumber}`,
      to: config.get<string[]>('EMAIL.DEFAULT_ADMINS'),
      subject: 'Applications near expiry',
    };

    await applicationExpiryConsumer.process();

    expect(mockApplicationService.getAllNearExpiryDates).toBeCalledTimes(1);
    expect(mockEmailService.sendEmail).toBeCalledTimes(1);
    expect(mockEmailService.sendEmail).toBeCalledWith(
      expectedParameterForEmailService,
    );
  });

  it('should not send email if no application near expiry', async () => {
    mockApplicationService.getAllNearExpiryDates.mockResolvedValue([]);

    await applicationExpiryConsumer.process();

    expect(mockApplicationService.getAllNearExpiryDates).toBeCalledTimes(1);
    expect(mockEmailService.sendEmail).toBeCalledTimes(0);
  });
});
