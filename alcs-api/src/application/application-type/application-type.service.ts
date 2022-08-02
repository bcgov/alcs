import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationType } from './application-type.entity';

@Injectable()
export class ApplicationTypeService {
  constructor(
    @InjectRepository(ApplicationType)
    private readonly applicationTypeRepository: Repository<ApplicationType>,
  ) {}

  async getAll(): Promise<ApplicationType[]> {
    return this.applicationTypeRepository.find();
  }

  async get(code: string): Promise<ApplicationType> {
    return this.applicationTypeRepository.findOne({
      where: {
        code,
      },
    });
  }
}
