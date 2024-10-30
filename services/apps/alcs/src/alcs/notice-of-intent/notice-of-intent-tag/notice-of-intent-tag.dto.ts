import { IsString } from 'class-validator';

export class NoticeOfIntentTagDto {
  @IsString()
  tagName: string;
}
