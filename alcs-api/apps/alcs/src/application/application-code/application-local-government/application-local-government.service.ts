import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationLocalGovernment } from './application-local-government.entity';

@Injectable()
export class ApplicationLocalGovernmentService {
  constructor(
    @InjectRepository(ApplicationLocalGovernment)
    private repository: Repository<ApplicationLocalGovernment>,
  ) {}

  async list() {
    return this.repository.find({
      order: {
        name: 'ASC',
      },
      relations: {
        preferredRegion: true,
      },
    });
  }

  async getByName(name: string) {
    return this.repository.findOne({
      where: {
        name,
      },
    });
  }
}
