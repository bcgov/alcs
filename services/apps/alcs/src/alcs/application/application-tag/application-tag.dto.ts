import { IsString } from 'class-validator';

export class ApplicationTagDto {
  @IsString()
  tagName: string;
}
