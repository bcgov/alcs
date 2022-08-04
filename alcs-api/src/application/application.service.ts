import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { APPLICATION_EXPIRATION_DAY_RANGES } from '../common/constant';
import {
  ApplicationTimeData,
  ApplicationTimeTrackingService,
} from './application-time-tracking.service';
import { Application } from './application.entity';

@Injectable()
export class ApplicationService {
  private DEFAULT_RELATIONS = ['status', 'type', 'assignee'];
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
    let applicationEntity = await this.applicationRepository.findOne({
      where: { fileNumber: application.fileNumber },
    });

    // TODO: replace with AutoMapper
    applicationEntity = applicationEntity ?? new Application();
    applicationEntity.fileNumber = application.fileNumber;
    applicationEntity.title = application.title;
    applicationEntity.applicant = application.applicant;
    applicationEntity.statusUuid = application.statusUuid;
    applicationEntity.typeUuid = application.typeUuid;
    applicationEntity.assigneeUuid = application.assigneeUuid;
    applicationEntity.paused = application.paused;

    await this.applicationRepository.save(applicationEntity);

    //Save does not return the full entity in case of update
    return this.applicationRepository.findOne({
      where: {
        uuid: applicationEntity.uuid,
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

  async getApplicationsNearExpiryDates(startDate, endDate) {
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
