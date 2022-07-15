import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationService } from '../application/application.service';
import { Repository } from 'typeorm';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationStatus } from './application-status.entity';

export const defaultApplicationStatus = {
  id: 'e0083fa2-9457-433b-b711-9344e1e3fd48',
  code: '1111',
};

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

  async delete(applicationStatusCode: string): Promise<void> {
    if (defaultApplicationStatus.code == applicationStatusCode) {
      throw new Error('You cannot delete default status');
    }

    const applicationStatus = await this.applicationStatusRepository.findOne({
      where: { code: applicationStatusCode },
    });

    if (!applicationStatus) {
      return;
    }

    await this.applicationService.resetApplicationStatus(
      applicationStatus.id,
      defaultApplicationStatus.id,
    );

    await this.applicationStatusRepository.softRemove([applicationStatus]);
    return;
  }

  async getAll(): Promise<ApplicationStatus[]> {
    const applicationStatuses = await this.applicationStatusRepository.find();

    return applicationStatuses;
  }
}
