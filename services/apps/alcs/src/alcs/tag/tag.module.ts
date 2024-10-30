import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagCategoryService } from './tag-category/tag-category.service';
import { TagCategoryController } from './tag-category/tag-category.controller';
import { TagCategory } from './tag-category/tag-category.entity';
import { Tag } from './tag.entity';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([TagCategory, Tag])],
  controllers: [TagCategoryController, TagController],
  providers: [TagCategoryService, TagService],
  exports: [TypeOrmModule],
})
export class TagModule {}
