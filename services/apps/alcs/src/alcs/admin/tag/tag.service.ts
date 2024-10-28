import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './tag.entity';
import { TagDto } from './tag.dto';
import { TagCategory } from '../tag-category/tag-category.entity';
import { ServiceValidationException } from '@app/common/exceptions/base.exception';

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
    const category = await this.categoryRepository.findOne({
      where: {
        uuid: dto.category.uuid,
      },
    });

    if (!category) {
      throw new ServiceValidationException('Provided category does not exist');
    }

    const newTag = new Tag();
    newTag.name = dto.name;
    newTag.isActive = dto.isActive;
    newTag.category = category;
    return this.repository.save(newTag);
  }

  async getOneOrFail(uuid: string) {
    return await this.repository.findOneOrFail({
      where: { uuid },
    });
  }

  async update(uuid: string, updateDto: TagDto) {
    const category = await this.categoryRepository.findOne({
      where: {
        uuid: updateDto.category.uuid,
      },
    });

    if (!category) {
      throw new ServiceValidationException('Provided category does not exist');
    }
    const tag = await this.getOneOrFail(uuid);
    tag.name = updateDto.name;
    tag.isActive = updateDto.isActive;
    tag.category = category;
    return await this.repository.save(tag);
  }

  async delete(uuid: string) {
    const tag = await this.getOneOrFail(uuid);

    return await this.repository.remove(tag);
  }
}
