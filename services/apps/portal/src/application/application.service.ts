import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './application.dto';
import { Application } from './application.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async getOrFail(fileNumber: string) {
    const application = await this.applicationRepository.findOne({
      where: {
        fileNumber,
      },
    });
    if (!application) {
      throw new Error('Failed to find document');
    }
    return application;
  }

  async create(createDto: CreateApplicationDto) {
    const pendingApplication = new Application({
      fileNumber: '2',
      applicant: createDto.applicant,
      localGovernmentUuid: createDto.localGovernmentUuid,
    });

    return this.applicationRepository.save(pendingApplication);
  }
}
