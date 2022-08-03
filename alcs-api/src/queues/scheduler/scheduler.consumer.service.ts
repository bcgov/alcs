import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { ApplicationService } from '../../application/application.service';
import { applicationExpirationDayRanges } from '../../common/constant';

@Processor('SchedulerQueue')
export class SchedulerConsumerService {
  private logger = new Logger(SchedulerConsumerService.name);

  constructor(
    @Inject(ApplicationService)
    private readonly applicationService: ApplicationService,
  ) {}

  @Process()
  async applicationExpiry() {
    this.logger.debug('starting applicationExpiry');

    const applicationsToProcess = await this.getApplicationsNearExpiryDates();
    //TODO: send an emails with application number list

    this.logger.debug('applicationExpiry complete');
    return {};
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
      -applicationExpirationDayRanges.ACTIVE_DAYS_START,
    );
    return this.applicationService.getApplicationsNearExpiryDates(
      startDate,
      endDate,
    );
  }
}
