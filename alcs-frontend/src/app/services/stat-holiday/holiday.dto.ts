export interface HolidayDto {
  uuid: string;
  name: string;
  day: Date;
}

export interface HolidayCreateDto {
  name: string;
  day: number;
}

export interface HolidayUpdateDto extends HolidayCreateDto {}
