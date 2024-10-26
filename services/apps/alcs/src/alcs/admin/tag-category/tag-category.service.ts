import { Injectable } from '@nestjs/common';
import { TagCategory } from './tag-category.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TagCategoryDto } from './tag-category.dto';

@Injectable()
export class TagCategoryService {
  constructor(
    @InjectRepository(TagCategory)
    private repository: Repository<TagCategory>,
  ) {}

  async fetch(pageIndex: number, itemsPerPage: number, search?: string) {
    let searchExpression: FindOptionsWhere<TagCategory> | undefined = undefined;

    if (search) {
      searchExpression = {
        name: Like(`%${search}%`),
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

    return await this.repository.remove(tagCategory);
  }
}
