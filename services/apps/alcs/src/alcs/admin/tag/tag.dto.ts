import { IsBoolean, IsObject, IsString } from 'class-validator';
import { TagCategoryDto } from '../tag-category/tag-category.dto';

export class TagDto {
  @IsString()
  name: string;

  @IsBoolean()
  isActive: boolean;

  @IsObject()
  category: TagCategoryDto;
}
