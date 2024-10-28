import { IsString } from 'class-validator';

export class TagCategoryDto {
  @IsString()
  uuid: string;

  @IsString()
  name: string;
}
