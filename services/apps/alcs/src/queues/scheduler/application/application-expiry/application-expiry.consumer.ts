import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import {
  ApplicationService,
  APPLICATION_EXPIRATION_DAY_RANGES,
} from '../../../../alcs/application/application.service';
import { EmailService } from '../../../../providers/email/email.service';
import { QUEUES } from '../../scheduler.service';

@Processor(QUEUES.APP_EXPIRY)
export class ApplicationExpiryConsumer extends WorkerHost {
  private logger = new Logger(ApplicationExpiryConsumer.name);

  constructor(
    private applicationService: ApplicationService,
    private emailService: EmailService,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {
    super();
  }

  async process() {
    try {
      this.logger.debug('starting applicationExpiry');

      const applicationsToProcess = await this.getApplicationsNearExpiryDates();

      if (applicationsToProcess && applicationsToProcess.length > 0) {
        const applicationsNumbers = applicationsToProcess.map(
          (ap) => ap.fileNumber,
        );
        // FIXME: this will be refactored once we have the templating engine
        const body = `
      <p>Following applications near expiration:</p>
      ${applicationsNumbers.join('<br/>')}`;

        await this.emailService.sendEmail({
          to: this.config.get<string[]>('EMAIL.DEFAULT_ADMINS'),
          body: body,
          subject: 'Applications near expiry',
        });
      } else {
        this.logger.log(`No applications to report on ${Date.now()}`);
      }

      this.logger.debug('applicationExpiry complete');
    } catch (e) {
      this.logger.error(e);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    this.logger.debug('Completed applicationExpiry job.');
  }

  private getApplicationsNearExpiryDates() {
    const startDate = dayjs().add(-90, 'day');
    const endDate = dayjs().add(
      -APPLICATION_EXPIRATION_DAY_RANGES.ACTIVE_DAYS_START,
      'day',
    );

    return this.applicationService.getAllNearExpiryDates(
      startDate.toDate(),
      endDate.toDate(),
    );
  }
}
