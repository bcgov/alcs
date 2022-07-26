import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    applicationEntity.body = application.body;
    applicationEntity.statusUuid = application.statusUuid;
    applicationEntity.assigneeUuid = application.assigneeUuid;

    await this.applicationRepository.save(applicationEntity);

    //Save does not return the full entity in case of update
    return this.applicationRepository.findOne({
      where: {
        uuid: applicationEntity.uuid,
      },
      relations: ['status', 'assignee'],
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
      relations: ['status', 'assignee'],
    });
  }

  async get(fileNumber: string) {
    return this.applicationRepository.findOne({
      where: {
        fileNumber,
      },
      relations: ['status', 'assignee'],
    });
  }
}
