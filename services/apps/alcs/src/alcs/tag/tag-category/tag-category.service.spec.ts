import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { TagCategory } from '../tag-category/tag-category.entity';
import { initTagCategoryMockEntity } from '../../../../test/mocks/mockEntities';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { TagCategoryDto } from './tag-category.dto';
import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { TagCategoryService } from './tag-category.service';
import { Tag } from '../tag.entity';

describe('TagCategoryService', () => {
  let service: TagCategoryService;
  let tagCategoryRepositoryMock: DeepMocked<Repository<TagCategory>>;
  let tagRepositoryMock: DeepMocked<Repository<Tag>>;
  let mockTagCategoryEntity;

  beforeEach(async () => {
    tagCategoryRepositoryMock = createMock<Repository<TagCategory>>();
    tagRepositoryMock = createMock<Repository<Tag>>();
    mockTagCategoryEntity = initTagCategoryMockEntity();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        TagCategoryService,
        {
          provide: getRepositoryToken(TagCategory),
          useValue: tagCategoryRepositoryMock,
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: tagRepositoryMock,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<TagCategoryService>(TagCategoryService);
    tagCategoryRepositoryMock.find.mockResolvedValue([]);
    tagCategoryRepositoryMock.findOne.mockResolvedValue(mockTagCategoryEntity);
    tagCategoryRepositoryMock.findOneOrFail.mockResolvedValue(mockTagCategoryEntity);
    tagCategoryRepositoryMock.save.mockResolvedValue(mockTagCategoryEntity);
    tagCategoryRepositoryMock = module.get(getRepositoryToken(TagCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get a tag category', async () => {
    expect(await service.getOneOrFail('fake')).toStrictEqual(mockTagCategoryEntity);
  });

  it('should call save when an tag category is updated', async () => {
    const payload: TagCategoryDto = {
      uuid: mockTagCategoryEntity.uuid,
      name: mockTagCategoryEntity.name,
    };

    const result = await service.update(mockTagCategoryEntity.uuid, payload);
    expect(result).toStrictEqual(mockTagCategoryEntity);
    expect(tagCategoryRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(tagCategoryRepositoryMock.save).toHaveBeenCalledWith(mockTagCategoryEntity);
  });

  it('should fail update if tag category does not exist', async () => {
    const payload: TagCategoryDto = {
      uuid: mockTagCategoryEntity.uuid,
      name: mockTagCategoryEntity.name,
    };

    tagCategoryRepositoryMock.findOneOrFail.mockRejectedValue(
      new ServiceValidationException(`Tag Category for with ${mockTagCategoryEntity.uuid} not found`),
    );

    await expect(service.update(mockTagCategoryEntity.uuid, payload)).rejects.toMatchObject(
      new ServiceValidationException(`Tag Category for with ${mockTagCategoryEntity.uuid} not found`),
    );
    expect(tagCategoryRepositoryMock.save).toBeCalledTimes(0);
  });

  it('should call save when tag successfully create', async () => {
    const payload: TagCategoryDto = {
      uuid: mockTagCategoryEntity.uuid,
      name: mockTagCategoryEntity.name,
    };

    await service.create(payload);

    expect(tagCategoryRepositoryMock.save).toBeCalledTimes(1);
  });
});
