import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { CRON_EXPRESSIONS } from '../../common/constant';

@Injectable()
export class SchedulerService {
  constructor(@InjectQueue('SchedulerQueue') private schedulerQueue: Queue) {}

  async scheduleApplicationExpiry() {
    await this.schedulerQueue.add(
      {},
      { repeat: { cron: CRON_EXPRESSIONS.MONDAY_TO_FRIDAY_AT_2AM } },
    );
  }
}
