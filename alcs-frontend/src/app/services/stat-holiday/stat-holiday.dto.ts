export interface StatHolidayDto {
  name: string;
  date: Date;
}

export interface StatHolidayCreateDto {
  name: string;
  date: number;
}

export interface StatHolidayUpdateDto extends StatHolidayCreateDto {}
