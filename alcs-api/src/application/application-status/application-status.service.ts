import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceValidationException } from '../../common/exceptions/base.exception';
import { ApplicationService } from '../application.service';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationStatus } from './application-status.entity';

export const defaultApplicationStatus = {
  id: '46235264-9529-4e52-9c2d-6ed2b8b9edb8',
  code: 'TODO',
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
    // TODO: replace with AutoMapper
    const applicationEntity = new ApplicationStatus();
    applicationEntity.code = application.code;
    applicationEntity.description = application.description;

    return await this.applicationStatusRepository.save(applicationEntity);
  }

  async fetchStatus(statusCode: string) {
    return await this.applicationStatusRepository.findOneOrFail({
      where: {
        code: statusCode,
      },
    });
  }

  async delete(applicationStatusCode: string): Promise<void> {
    if (defaultApplicationStatus.code === applicationStatusCode) {
      throw new ServiceValidationException('You cannot delete default status');
    }

    const applicationStatus = await this.applicationStatusRepository.findOne({
      where: { code: applicationStatusCode },
    });

    if (!applicationStatus) {
      return;
    }

    await this.applicationService.resetApplicationStatus(
      applicationStatus.uuid,
      defaultApplicationStatus.id,
    );

    await this.applicationStatusRepository.softRemove([applicationStatus]);
    return;
  }

  async getAll(): Promise<ApplicationStatus[]> {
    return this.applicationStatusRepository.find();
  }
}
