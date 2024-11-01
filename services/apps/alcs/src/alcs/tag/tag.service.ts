import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './tag.entity';
import { TagDto } from './tag.dto';
import { TagCategory } from './tag-category/tag-category.entity';
import { ServiceConflictException, ServiceNotFoundException } from '@app/common/exceptions/base.exception';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private repository: Repository<Tag>,
    @InjectRepository(TagCategory)
    private categoryRepository: Repository<TagCategory>,
  ) {}

  async fetch(pageIndex: number, itemsPerPage: number, search?: string) {
    let searchExpression: FindOptionsWhere<Tag> | undefined = undefined;

    if (search) {
      searchExpression = {
        name: ILike(`%${search}%`),
      };
    }

    return (
      (await this.repository.findAndCount({
        where: searchExpression,
        relations: {
          category: true,
        },
        order: { name: 'ASC' },
        take: itemsPerPage,
        skip: pageIndex * itemsPerPage,
      })) || [[], 0]
    );
  }

  async create(dto: TagDto) {
    const category = dto.category
      ? await this.categoryRepository.findOne({
          where: {
            uuid: dto.category.uuid,
          },
        })
      : null;

    const newTag = new Tag();
    newTag.name = dto.name;
    newTag.isActive = dto.isActive;
    newTag.category = category ? category : null;
    return this.repository.save(newTag);
  }

  async getOneOrFail(uuid: string) {
    return await this.repository.findOneOrFail({
      where: { uuid },
    });
  }

  async update(uuid: string, updateDto: TagDto) {
    const category = updateDto.category
      ? await this.categoryRepository.findOne({
          where: {
            uuid: updateDto.category.uuid,
          },
        })
      : null;
    const tag = await this.getOneOrFail(uuid);
    tag.name = updateDto.name;
    tag.isActive = updateDto.isActive;
    tag.category = category ? category : null;
    return await this.repository.save(tag);
  }

  async delete(uuid: string) {
    if (await this.isAssociated(uuid)) {
      throw new ServiceConflictException('Tag is associated with files. Unable to delete.');
    }
    return await this.repository.softDelete(uuid);
  }

  async isAssociated(uuid: string) {
    const tag = await this.repository.findOne({
      where: { uuid: uuid },
      relations: ['applications', 'noticeOfIntents'],
    });

    if (!tag) {
      throw new ServiceNotFoundException('Tag not found');
    }

    return (tag.applications && tag.applications.length > 0) || (tag.noticeOfIntents && tag.noticeOfIntents.length > 0);
  }
}
