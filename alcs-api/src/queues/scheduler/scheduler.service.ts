import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class SchedulerService {
  constructor(@InjectQueue('SchedulerQueue') private schedulerQueue: Queue) {}

  async scheduleApplicationExpiry() {
    // await this.schedulerQueue.add({}, { repeat: { cron: '0 28 15 * * *' } });
    await this.schedulerQueue.add({});
  }
}
