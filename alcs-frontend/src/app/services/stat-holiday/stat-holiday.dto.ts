export interface StatHolidayDto {
  uuid: string;
  name: string;
  day: Date;
}

export interface StatHolidayCreateDto {
  name: string;
  day: number;
}

export interface StatHolidayUpdateDto extends StatHolidayCreateDto {}
