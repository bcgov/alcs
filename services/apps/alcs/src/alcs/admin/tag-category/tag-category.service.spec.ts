import { Test, TestingModule } from '@nestjs/testing';
import { TagCategoryService } from './tag-category.service';

describe('TagCategoryService', () => {
  let service: TagCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagCategoryService],
    }).compile();

    service = module.get<TagCategoryService>(TagCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
