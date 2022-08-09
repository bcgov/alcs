import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import {
  ApplicationTimeData,
  ApplicationTimeTrackingService,
} from './application-time-tracking.service';
import { Application } from './application.entity';

export const APPLICATION_EXPIRATION_DAY_RANGES = {
  ACTIVE_DAYS_START: 55,
  ACTIVE_DAYS_END: 60,
};

@Injectable()
export class ApplicationService {
  private DEFAULT_RELATIONS = [
    'status',
    'type',
    'assignee',
    'decisionMaker',
    'region',
  ];
  private logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private applicationTimeTrackingService: ApplicationTimeTrackingService,
  ) {}

  async resetApplicationStatus(
    sourceStatusId: string,
    targetStatusId: string,
  ): Promise<void> {
    await this.applicationRepository.update(
      {
        statusUuid: sourceStatusId,
      },
      {
        statusUuid: targetStatusId,
      },
    );
  }

  async createOrUpdate(
    application: Partial<Application>,
  ): Promise<Application> {
    const existingApplication = await this.applicationRepository.findOne({
      where: { fileNumber: application.fileNumber },
    });

    const updatedApp = Object.assign(
      existingApplication || new Application(),
      application,
    );
    await this.applicationRepository.save(updatedApp);

    //Save does not return the full entity in case of update
    return this.applicationRepository.findOne({
      where: {
        uuid: updatedApp.uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async delete(applicationNumber: string): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { fileNumber: applicationNumber },
    });

    await this.applicationRepository.softRemove([application]);
    return;
  }

  async getAll(statusIds?: string[]): Promise<Application[]> {
    let whereClause = {};
    if (statusIds && statusIds.length > 0) {
      whereClause = { statusId: In(statusIds) };
    }

    return await this.applicationRepository.find({
      where: whereClause,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async get(fileNumber: string) {
    return this.applicationRepository.findOne({
      where: {
        fileNumber,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getApplicationsNearExpiryDates(startDate: Date, endDate: Date) {
    const applications = await this.applicationRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    let applicationsProcessingTimes: Map<string, ApplicationTimeData>;

    if (applications && applications.length > 0) {
      applicationsProcessingTimes =
        await this.applicationTimeTrackingService.fetchApplicationActiveTimes(
          applications,
        );
    }

    const applicationsToProcess: Application[] = [];

    applicationsProcessingTimes.forEach((val, key) => {
      if (
        val.activeDays >= APPLICATION_EXPIRATION_DAY_RANGES.ACTIVE_DAYS_START &&
        val.activeDays <= APPLICATION_EXPIRATION_DAY_RANGES.ACTIVE_DAYS_END
      ) {
        applicationsToProcess.push(applications.find((ap) => ap.uuid === key));
      } else {
        applicationsProcessingTimes.delete(key);
      }
    });

    return applicationsToProcess;
  }
}
