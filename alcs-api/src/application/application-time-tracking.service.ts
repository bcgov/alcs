import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessDayService } from '../providers/business-days/business-day.service';
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
    private businessDayService: BusinessDayService,
  ) {}

  async fetchApplicationActiveTimes(applications: Application[]) {
    const appUuids = applications.map((app) => app.uuid);
    const pausedTimes = await this.getApplicationPausedTimes(appUuids);

    const resultMap = new Map<string, ApplicationTimeData>();

    applications.forEach((app) => {
      const totalBusinessDays = this.businessDayService.calculateDays(
        new Date(app.createdAt),
        new Date(),
      );
      const pausedDays = pausedTimes.get(app.uuid);

      resultMap.set(app.uuid, {
        pausedDays: pausedDays || 0,
        activeDays: totalBusinessDays - pausedDays,
      });
    });

    return resultMap;
  }

  private async getApplicationPausedTimes(applicationUuids: string[]) {
    const pausedTimes = (await this.applicationPausedRepository.query(
      `
        SELECT * from calculate_paused_time($1)`,
      [`{${applicationUuids.join(', ')}}`],
    )) as { application_uuid: string; days: string }[];

    const results = new Map<string, number>();
    applicationUuids.forEach((appUuid) => {
      results.set(appUuid, 0);
    });
    pausedTimes.forEach((time) => {
      results.set(time.application_uuid, parseInt(time.days));
    });
    return results;
  }
}
