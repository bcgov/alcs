import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { TagCategoryDto } from './tag-category/tag-category.dto';

export class TagDto {
  @IsString()
  uuid: string;

  @IsString()
  name: string;

  @IsBoolean()
  isActive: boolean;

  @IsObject()
  @IsOptional()
  category?: TagCategoryDto | null;
}
