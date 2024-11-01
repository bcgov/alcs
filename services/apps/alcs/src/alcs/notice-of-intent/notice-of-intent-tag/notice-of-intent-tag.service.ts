import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../../tag/tag.entity';
import { NoticeOfIntent } from '../notice-of-intent.entity';
import { Repository } from 'typeorm';
import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';

@Injectable()
export class NoticeOfIntentTagService {
  constructor(
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(NoticeOfIntent) private noiRepository: Repository<NoticeOfIntent>,
  ) {}

  async addTagToNoticeOfIntent(fileNumber: string, tagName: string) {
    const noi = await this.noiRepository.findOne({
      where: { fileNumber: fileNumber },
      relations: ['tags'],
    });
    if (!noi) {
      throw new ServiceNotFoundException(`Notice of Intent not found with number ${fileNumber}`);
    }

    const tag = await this.tagRepository.findOne({ where: { name: tagName } });
    if (!tag) {
      throw new ServiceNotFoundException(`Tag not found with name ${tagName}`);
    }

    if (!noi.tags) {
      noi.tags = [];
    }

    const tagExists = noi.tags.some((t) => t.uuid === tag.uuid);
    console.log(tagExists);
    if (tagExists) {
      throw new ServiceValidationException(`Tag ${tagName} already exists`);
    }

    noi.tags.push(tag);
    return (await this.noiRepository.save(noi)).tags;
  }

  async removeTagFromNoticeOfIntent(fileNumber: string, tagName: string) {
    const noi = await this.noiRepository.findOne({
      where: { fileNumber: fileNumber },
      relations: ['tags'],
    });
    if (!noi) {
      throw new ServiceNotFoundException(`Notice of Intent not found with number ${fileNumber}`);
    }

    const tag = await this.tagRepository.findOne({ where: { name: tagName } });
    if (!tag) {
      throw new ServiceNotFoundException(`Tag not found with name ${tagName}`);
    }

    if (!noi.tags) {
      noi.tags = [];
    }

    const tagExists = noi.tags.some((t) => t.uuid === tag.uuid);
    if (!tagExists) {
      throw new ServiceValidationException(`Tag ${tagName} does not exist`);
    }

    noi.tags = noi.tags.filter((t) => t.uuid !== tag.uuid);
    return (await this.noiRepository.save(noi)).tags;
  }

  async getNoticeOfIntentTags(fileNumber: string) {
    const noi = await this.noiRepository.findOne({
      where: { fileNumber: fileNumber },
      relations: ['tags'],
      order: { auditCreatedAt: 'ASC' },
    });
    if (!noi) {
      throw new ServiceNotFoundException(`Notice of Intent not found with number ${fileNumber}`);
    }
    return noi.tags && noi.tags.length > 0 ? noi.tags : [];
  }
}
