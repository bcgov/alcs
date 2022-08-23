import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationPaused } from './application-paused.entity';
import { Application } from './application.entity';

export type ApplicationTimeData = {
  activeDays: number;
  pausedDays: number;
};

@Injectable()
export class ApplicationTimeTrackingService {
  constructor(
    @InjectRepository(ApplicationPaused)
    private applicationPausedRepository: Repository<ApplicationPaused>,
  ) {}

  async fetchApplicationActiveTimes(applications: Application[]) {
    const appUuids = applications.map((app) => app.uuid);
    return await this.getTimes(appUuids);
  }

  async getTimes(applicationUuids: string[]) {
    const pausedTimes = (await this.applicationPausedRepository.query(
      `
        SELECT * from calculate_active_days($1)`,
      [`{${applicationUuids.join(', ')}}`],
    )) as {
      application_uuid: string;
      paused_days: string;
      active_days: string;
    }[];

    const results = new Map<string, ApplicationTimeData>();
    applicationUuids.forEach((appUuid) => {
      results.set(appUuid, {
        pausedDays: 0,
        activeDays: 0,
      });
    });
    pausedTimes.forEach((time) => {
      results.set(time.application_uuid, {
        activeDays: parseInt(time.active_days),
        pausedDays: parseInt(time.paused_days),
      });
    });
    return results;
  }
}
