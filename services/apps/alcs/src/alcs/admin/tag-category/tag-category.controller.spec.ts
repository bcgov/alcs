import { Test, TestingModule } from '@nestjs/testing';
import { TagCategoryController } from './tag-category.controller';

describe('TagCategoryController', () => {
  let controller: TagCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagCategoryController],
    }).compile();

    controller = module.get<TagCategoryController>(TagCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
