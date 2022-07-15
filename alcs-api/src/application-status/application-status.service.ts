import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationService } from 'src/application/application.service';
import { Repository } from 'typeorm';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationStatus } from './application-status.entity';

const defaultApplicationStatusId = 'e0083fa2-9457-433b-b711-9344e1e3fd48';

@Injectable()
export class ApplicationStatusService {
  private readonly logger: Logger = new Logger(ApplicationStatusService.name);

  constructor(
    @InjectRepository(ApplicationStatus)
    private readonly applicationStatusRepository: Repository<ApplicationStatus>,
    @Inject(ApplicationService)
    private readonly applicationService: ApplicationService,
  ) {}

  async create(application: ApplicationStatusDto): Promise<ApplicationStatus> {
    // TODO replace with AutoMapper
    const applicationEntity = new ApplicationStatus();
    applicationEntity.code = application.code;
    applicationEntity.description = application.description;

    return await this.applicationStatusRepository.save(applicationEntity);
  }

  async resetApplicationStatus(statusId: string): Promise<void> {
    // TODO this needs to be done in bulk
    const applicationsToReset = await this.applicationService.getAll([
      statusId,
    ]);
    applicationsToReset?.forEach((application) => {
      application.statusId = defaultApplicationStatusId;
      this.applicationService.create(application);
    });
  }

  async delete(applicationStatusCode: string): Promise<void> {
    const applicationStatus = await this.applicationStatusRepository.findOne({
      where: { code: applicationStatusCode },
    });

    if (defaultApplicationStatusId == applicationStatus.id) {
      throw Error('You cannot delete default status');
    }

    if (!applicationStatus) {
      return;
    }

    await this.resetApplicationStatus(applicationStatus.id);

    await this.applicationStatusRepository.softRemove([applicationStatus]);
    return;
  }

  async getAll(): Promise<ApplicationStatus[]> {
    const applications = await this.applicationStatusRepository.find();

    return applications;
  }
}
