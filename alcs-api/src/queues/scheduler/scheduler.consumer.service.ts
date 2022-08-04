import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { ApplicationService } from '../../application/application.service';
import { CONFIG_TOKEN, IConfig } from '../../common/config/config.module';
import { APPLICATION_EXPIRATION_DAY_RANGES } from '../../common/constant';
import { EmailService } from '../../providers/email/email.service';

@Processor('SchedulerQueue')
export class SchedulerConsumerService {
  private logger = new Logger(SchedulerConsumerService.name);

  constructor(
    @Inject(ApplicationService)
    private applicationService: ApplicationService,
    @Inject(EmailService)
    private emailService: EmailService,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {}

  @Process()
  async applicationExpiry() {
    this.logger.debug('starting applicationExpiry');

    const applicationsToProcess = await this.getApplicationsNearExpiryDates();

    if (applicationsToProcess && applicationsToProcess.length > 0) {
      const applicationsNumbers = applicationsToProcess.map(
        (ap) => ap.fileNumber,
      );
      // TODO: this will be refactored once we have the templating engine
      const body = `
      <p>Following applications near expiration:</p>
      ${applicationsNumbers.join('<br/>')}`;

      await this.emailService.sendEmail({
        to: this.config.get<string[]>('EMAIL.DEFAULT_ADMIN'),
        body: body,
        subject: 'Applications near expiry',
      });
    } else {
      this.logger.log(`No applications to report on ${Date.now()}`);
    }

    this.logger.debug('applicationExpiry complete');
    return;
  }

  private addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private getApplicationsNearExpiryDates() {
    const startDate = this.addDays(new Date(), -90);
    const endDate = this.addDays(
      new Date(),
      -APPLICATION_EXPIRATION_DAY_RANGES.ACTIVE_DAYS_START,
    );
    return this.applicationService.getApplicationsNearExpiryDates(
      startDate,
      endDate,
    );
  }
}
