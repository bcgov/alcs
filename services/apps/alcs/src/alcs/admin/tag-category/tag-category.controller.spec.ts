import { Test, TestingModule } from '@nestjs/testing';
import { TagCategoryController } from './tag-category.controller';
import { TagCategoryService } from './tag-category.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ClsService } from 'nestjs-cls';
import { initTagCategoryMockEntity } from '../../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { TagCategory } from './tag-category.entity';
import { TagCategoryDto } from './tag-category.dto';

describe('TagCategoryController', () => {
  let controller: TagCategoryController;
  let tagCategoryService: DeepMocked<TagCategoryService>;

  const mockCategoryTag = initTagCategoryMockEntity();

  beforeEach(async () => {
    tagCategoryService = createMock<TagCategoryService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagCategoryController],
      providers: [
        { provide: TagCategoryService, useValue: tagCategoryService },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<TagCategoryController>(TagCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get a tag category', async () => {
    tagCategoryService.fetch.mockResolvedValue([[mockCategoryTag], 1]);

    const result = await controller.fetch(0, 0);
    expect(tagCategoryService.fetch).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual([mockCategoryTag]);
    expect(result.total).toEqual(1);
  });

  it('should create a tag category', async () => {
    tagCategoryService.create.mockResolvedValue(mockCategoryTag);

    const result = await controller.create(mockCategoryTag);
    expect(tagCategoryService.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategoryTag);
  });

  it('should update tag category', async () => {
    tagCategoryService.update.mockResolvedValue({
      ...mockCategoryTag,
    } as TagCategory);
    const categoryToUpdate = {
      uuid: mockCategoryTag.uuid,
      name: mockCategoryTag.name,
    } as TagCategoryDto;

    const result = await controller.update(
      mockCategoryTag.uuid,
      categoryToUpdate,
    );

    expect(tagCategoryService.update).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategoryTag);
  });

  it('should delete a tag category', async () => {
    tagCategoryService.delete.mockResolvedValue(mockCategoryTag);

    const result = await controller.delete(mockCategoryTag.uuid);
    expect(tagCategoryService.delete).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategoryTag);
  });
});
