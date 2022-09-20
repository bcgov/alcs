import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationService } from '../application.service';
import { ApplicationStatusDto } from './application-status.dto';
import { CardStatus } from './application-status.entity';

export const defaultApplicationStatus = {
  id: '46235264-9529-4e52-9c2d-6ed2b8b9edb8',
  code: 'TODO',
};

@Injectable()
export class ApplicationStatusService {
  constructor(
    @InjectRepository(CardStatus)
    private applicationStatusRepository: Repository<CardStatus>,
    private applicationService: ApplicationService,
  ) {}

  async create(application: ApplicationStatusDto): Promise<CardStatus> {
    const applicationEntity = new CardStatus();
    applicationEntity.code = application.code;
    applicationEntity.description = application.description;

    return await this.applicationStatusRepository.save(applicationEntity);
  }
}
