import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

const MONDAY_TO_FRIDAY_AT_2AM = '0 0 2 * * 1-5';

@Injectable()
export class SchedulerService {
  constructor(@InjectQueue('SchedulerQueue') private schedulerQueue: Queue) {}

  async scheduleApplicationExpiry() {
    await this.schedulerQueue.add(
      {},
      { repeat: { cron: MONDAY_TO_FRIDAY_AT_2AM } },
    );
  }
}
