import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApplicationCreateDto } from './application.dto';
import { Application } from './application.entity';

@Injectable()
export class ApplicationService {
  private readonly logger: Logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async create(application: ApplicationCreateDto): Promise<Application> {
    let applicationEntity = await this.applicationRepository.findOne({
      where: { number: application.number },
    });

    // TODO replace with AutoMapper
    applicationEntity = applicationEntity ?? new Application();
    applicationEntity.number = application.number;
    applicationEntity.title = application.title;
    applicationEntity.body = application.body;

    if (applicationEntity.statusId)
      applicationEntity.statusId = application.statusId;

    return await this.applicationRepository.save(applicationEntity);
  }

  async delete(applicationNumber: string): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { number: applicationNumber },
    });

    await this.applicationRepository.softRemove([application]);
    return;
  }

  async getAll(statusIds?: string[]): Promise<Application[]> {
    let whereClause = {};
    if (statusIds && statusIds.length > 0)
      whereClause = { statusId: In(statusIds) };

    const applications = await this.applicationRepository.find({
      where: whereClause,
      relations: ['status'],
    });

    return applications;
  }
}
