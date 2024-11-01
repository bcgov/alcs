import { Injectable } from '@nestjs/common';
import { TagCategory } from './tag-category.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TagCategoryDto } from './tag-category.dto';
import { Tag } from '../tag.entity';
import { ServiceConflictException } from '@app/common/exceptions/base.exception';

@Injectable()
export class TagCategoryService {
  constructor(
    @InjectRepository(TagCategory)
    private repository: Repository<TagCategory>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async fetch(pageIndex: number, itemsPerPage: number, search?: string) {
    let searchExpression: FindOptionsWhere<TagCategory> | undefined = undefined;

    if (search) {
      searchExpression = {
        name: ILike(`%${search}%`),
      };
    }

    return (
      (await this.repository.findAndCount({
        where: searchExpression,
        order: { name: 'ASC' },
        take: itemsPerPage,
        skip: pageIndex * itemsPerPage,
      })) || [[], 0]
    );
  }

  async create(dto: TagCategoryDto) {
    const newTagCategory = new TagCategory();
    newTagCategory.name = dto.name;
    return this.repository.save(newTagCategory);
  }

  async getOneOrFail(uuid: string) {
    return await this.repository.findOneOrFail({
      where: { uuid },
    });
  }

  async update(uuid: string, updateDto: TagCategoryDto) {
    const tagCategory = await this.getOneOrFail(uuid);
    tagCategory.name = updateDto.name;
    return await this.repository.save(tagCategory);
  }

  async delete(uuid: string) {
    const tagCategory = await this.getOneOrFail(uuid);

    if (await this.isAssociated(tagCategory)) {
      throw new ServiceConflictException('Category is associated with tags. Unable to delete.');
    }
    return await this.repository.remove(tagCategory);
  }

  async isAssociated(tagCategory: TagCategory) {
    const associatedTags = await this.tagRepository.find({ where: { category: { uuid: tagCategory.uuid } } });

    console.log(associatedTags);

    return associatedTags.length > 0;
  }
}
