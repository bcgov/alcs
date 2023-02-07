import { IsNumber, IsString } from 'class-validator';

export class HolidayUpdateDto {
  @IsString()
  name: string;

  @IsNumber()
  day: number;
}

export class HolidayCreateDto extends HolidayUpdateDto {}
