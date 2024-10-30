import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../tag/tag.entity';
import { Application } from '../application.entity';
import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';

@Injectable()
export class ApplicationTagService {
  private logger = new Logger(ApplicationTagService.name);

  constructor(
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(Application) private applicationRepository: Repository<Application>,
  ) {}

  async addTagToApplication(fileNumber: string, tagName: string) {
    const application = await this.applicationRepository.findOne({ where: { fileNumber: fileNumber } });
    if (!application) {
      throw new ServiceNotFoundException(`Application not found with number ${fileNumber}`);
    }

    const tag = await this.tagRepository.findOne({ where: { name: tagName } });
    if (!tag) {
      throw new ServiceNotFoundException(`Tag not found with name ${tagName}`);
    }

    if (!application.tags) {
      application.tags = [];
    }
    application.tags.push(tag);
    return this.applicationRepository.save(application);
  }

  async removeTagFromApplication(fileNumber: string, tagName: string) {
    const application = await this.applicationRepository.findOne({ where: { fileNumber: fileNumber } });
    if (!application) {
      throw new ServiceNotFoundException(`Application not found with number ${fileNumber}`);
    }

    const tag = await this.tagRepository.findOne({ where: { name: tagName } });
    if (!tag) {
      throw new ServiceNotFoundException(`Tag not found with name ${tagName}`);
    }

    if (!application.tags) {
      application.tags = [];
    }
    application.tags = application.tags.filter((t) => t.uuid !== tag.uuid);
    return this.applicationRepository.save(application);
  }

  async getApplicationTags(fileNumber: string) {
    const application = await this.applicationRepository.findOne({
      where: { fileNumber: fileNumber },
      relations: ['tags'],
    });
    if (!application) {
      throw new ServiceNotFoundException(`Application not found with number ${fileNumber}`);
    }
    return application.tags && application.tags.length > 0
      ? application.tags.sort((a, b) => a.auditCreatedAt.getTime() - b.auditCreatedAt.getTime())
      : [];
  }
}
