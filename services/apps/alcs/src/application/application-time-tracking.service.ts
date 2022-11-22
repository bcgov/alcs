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

  async fetchActiveTimes(applications: Application[]) {
    const appUuids = applications.map((app) => app.uuid);
    return await this.getTimes(appUuids);
  }

  async getPausedStatus(applications: Application[]) {
    const appUuids = applications.map((app) => app.uuid);
    const pausedCalculations = (await this.applicationPausedRepository.query(
      `
        SELECT application_uuid,
               count(uuid)
        FROM application_paused
        WHERE start_date < NOW()
          AND COALESCE(end_date, NOW()) >= NOW()
          AND application_uuid = ANY($1)
        GROUP BY application_uuid;`,
      [`{${appUuids.join(', ')}}`],
    )) as {
      application_uuid: string;
      count: number;
    }[];

    const result = new Map<string, boolean>();
    for (const appId of appUuids) {
      const isPaused = pausedCalculations.find(
        (row) => row.application_uuid === appId,
      );
      result.set(appId, !!isPaused);
    }
    return result;
  }

  async getTimes(applicationUuids: string[]) {
    const activeCounts = (await this.applicationPausedRepository.query(
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
    activeCounts.forEach((time) => {
      results.set(time.application_uuid, {
        activeDays: parseInt(time.active_days),
        pausedDays: parseInt(time.paused_days),
      });
    });
    return results;
  }
}
