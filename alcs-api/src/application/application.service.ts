import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { Application } from './application.entity';

@Injectable()
export class ApplicationService {
  private readonly logger: Logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async resetApplicationStatus(
    sourceStatusId: string,
    targetStatusId: string,
  ): Promise<void> {
    await this.applicationRepository.update(
      {
        statusId: sourceStatusId,
      },
      {
        statusId: targetStatusId,
      },
    );
  }

  async create(application: Partial<Application>): Promise<Application> {
    let applicationEntity = await this.applicationRepository.findOne({
      where: { fileNumber: application.fileNumber },
    });

    // TODO replace with AutoMapper
    applicationEntity = applicationEntity ?? new Application();
    applicationEntity.fileNumber = application.fileNumber;
    applicationEntity.title = application.title;
    applicationEntity.body = application.body;

    return await this.applicationRepository.save(applicationEntity);
  }

  async update(application: Partial<Application>) {
    const applicationEntity = await this.applicationRepository.findOne({
      where: { fileNumber: application.fileNumber },
    });

    if (!applicationEntity) {
      throw new ServiceValidationException('Application not found');
    }

    await this.applicationRepository.update(applicationEntity.id, application);

    return this.applicationRepository.findOne({
      where: {
        id: applicationEntity.id,
      },
      relations: ['status'],
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
      relations: ['status'],
    });
  }
}
