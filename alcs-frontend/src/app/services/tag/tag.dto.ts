import { TagCategoryDto } from "./tag-category/tag-category.dto";

export interface TagDto {
  uuid: string;
  name: string;
  category?: TagCategoryDto;
  isActive: boolean;
}
