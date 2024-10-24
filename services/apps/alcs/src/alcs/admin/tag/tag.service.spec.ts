import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { TagCategory } from '../tag-category/tag-category.entity';
import {
  initTagCategoryMockEntity,
  initTagMockEntity,
} from 'apps/alcs/test/mocks/mockEntities';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { TagDto } from './tag.dto';
import { ServiceValidationException } from '@app/common/exceptions/base.exception';

describe('TagCategoryService', () => {
  let service: TagService;
  let tagRepositoryMock: DeepMocked<Repository<Tag>>;
  let tagCategoryRepositoryMock: DeepMocked<Repository<TagCategory>>;
  let mockTagEntity;
  let mockTagCategoryEntity;

  beforeEach(async () => {
    tagRepositoryMock = createMock<Repository<Tag>>();
    tagCategoryRepositoryMock = createMock<Repository<TagCategory>>();
    mockTagEntity = initTagMockEntity();
    mockTagCategoryEntity = initTagCategoryMockEntity();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        TagService,
        {
          provide: getRepositoryToken(Tag),
          useValue: tagRepositoryMock,
        },
        {
          provide: getRepositoryToken(TagCategory),
          useValue: tagCategoryRepositoryMock,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);

    tagRepositoryMock.findOne.mockResolvedValue(mockTagEntity);
    tagRepositoryMock.save.mockResolvedValue(mockTagEntity);
    tagCategoryRepositoryMock = module.get(getRepositoryToken(TagCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get a tag', async () => {
    expect(await service.getOneOrFail('fake')).toStrictEqual(mockTagEntity);
  });

  it('should call save when an Tag is updated', async () => {
    const payload: TagDto = {
      name: mockTagEntity.name,
      isActive: mockTagEntity.isActive,
      category: mockTagCategoryEntity,
    };

    const result = await service.update(mockTagEntity.uuid, payload);
    expect(result).toStrictEqual(mockTagEntity);
    expect(tagRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(tagRepositoryMock.save).toHaveBeenCalledWith(mockTagEntity);
  });

  it('should fail update if tag does not exist', async () => {
    const payload: TagDto = {
      name: mockTagEntity.name,
      isActive: mockTagEntity.isActive,
      category: mockTagCategoryEntity,
    };

    tagRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.update(mockTagEntity.uuid, payload),
    ).rejects.toMatchObject(
      new ServiceValidationException(
        `Card for with ${mockTagEntity.uuid} not found`,
      ),
    );
    expect(tagRepositoryMock.save).toBeCalledTimes(0);
  });

  it('should call save when tag successfully create', async () => {
    const payload: TagDto = {
      name: mockTagEntity.name,
      isActive: mockTagEntity.isActive,
      category: mockTagCategoryEntity,
    };

    await service.create(payload);

    expect(tagRepositoryMock.save).toBeCalledTimes(1);
  });

  it('should fail on create if Tag Category does not exist', async () => {
    const payload: TagDto = {
      name: mockTagEntity.name,
      isActive: mockTagEntity.isActive,
      category: mockTagCategoryEntity,
    };

    tagCategoryRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.create(payload)).rejects.toMatchObject(
      new ServiceValidationException('Provided category does not exist'),
    );

    expect(tagRepositoryMock.save).toBeCalledTimes(0);
  });
});
