import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../tag/tag.entity';
import { Application } from '../application.entity';
import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';

@Injectable()
export class ApplicationTagService {
  constructor(
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(Application) private applicationRepository: Repository<Application>,
  ) {}

  async addTagToApplication(fileNumber: string, tagName: string) {
    const application = await this.applicationRepository.findOne({
      where: { fileNumber: fileNumber },
      relations: ['tags'],
    });
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

    const tagExists = application.tags.some((t) => t.uuid === tag.uuid);
    if (tagExists) {
      throw new ServiceValidationException(`Tag ${tagName} already exists`);
    }

    application.tags.push(tag);
    return this.applicationRepository.save(application);
  }

  async removeTagFromApplication(fileNumber: string, tagName: string) {
    const application = await this.applicationRepository.findOne({
      where: { fileNumber: fileNumber },
      relations: ['tags'],
    });
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

    const tagExists = application.tags.some((t) => t.uuid === tag.uuid);
    if (!tagExists) {
      throw new ServiceValidationException(`Tag ${tagName} does not exist in the application`);
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

    return application.tags && application.tags.length > 0 ? application.tags : [];
  }
}
