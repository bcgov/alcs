import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { HolidayCreateDto, HolidayUpdateDto } from './holiday.dto';
import { HolidayEntity } from './holiday.entity';
import { getStartOfDayToPacific } from '../../../utils/pacific-date-time-helper';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(HolidayEntity)
    private holidayRepository: Repository<HolidayEntity>,
  ) {}

  async fetch(pageIndex: number, itemsPerPage: number, search?: number) {
    let searchExpression: FindOptionsWhere<HolidayEntity> | undefined =
      undefined;

    if (search) {
      searchExpression = {
        day: Between(new Date(search, 0), new Date(search, 12)),
      };
    }

    return (
      (await this.holidayRepository.findAndCount({
        where: searchExpression,
        order: { day: 'DESC' },
        take: itemsPerPage,
        skip: pageIndex * itemsPerPage,
      })) || [[], 0]
    );
  }

  async getOneOrFail(uuid: string) {
    return await this.holidayRepository.findOneOrFail({
      where: { uuid },
    });
  }

  async update(uuid: string, updateDto: HolidayUpdateDto) {
    const holiday = await this.getOneOrFail(uuid);

    holiday.day = new Date(updateDto.day);
    holiday.name = updateDto.name;

    return await this.holidayRepository.save(holiday);
  }

  async create(createDto: HolidayCreateDto) {
    const holiday = new HolidayEntity();
    holiday.day = new Date(createDto.day);
    holiday.name = createDto.name;

    return await this.holidayRepository.save(holiday);
  }

  async delete(uuid: string) {
    const holiday = await this.getOneOrFail(uuid);

    return await this.holidayRepository.remove(holiday);
  }

  async fetchAllYears() {
    const res = (await this.holidayRepository.query(
      'SELECT DISTINCT EXTRACT(YEAR FROM day) as year FROM alcs.holiday_entity ORDER BY year DESC;',
    )) as { year: string }[];
    return res.map((res) => res.year);
  }

  async fetchAllHolidays() {
    return await this.holidayRepository
      .createQueryBuilder('holiday')
      .select('holiday.day')
      .getMany();
  }

  calculateBusinessDays(
    fromDate: Date,
    toDate: Date,
    holidays: HolidayEntity[],
  ): number {
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    const holidaysSet = new Set<string>(
      holidays.map((holiday) => formatDate(new Date(holiday.day))),
    );

    const isWeekend = (date: Date): boolean => {
      const day = date.getDay();
      return day === 0 || day === 6;
    };

    const isBusinessDay = (date: Date): boolean => {
      return isWeekend(date) || holidaysSet.has(formatDate(date))
        ? false
        : true;
    };

    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const differenceInDays = (startDate: Date, endDate: Date): number => {
      const timeDiff =
        getStartOfDayToPacific(endDate.getTime()).getTime() -
        getStartOfDayToPacific(startDate.getTime()).getTime();
      return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    };

    console.log(fromDate);
    console.log(toDate);

    console.log(getStartOfDayToPacific(fromDate.getTime()));

    const totalDays = differenceInDays(fromDate, toDate) + 1;
    console.log(totalDays);
    console.log('=======');
    let businessDaysCount = 0;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = addDays(fromDate, i);
      if (isBusinessDay(currentDate)) {
        businessDaysCount++;
      }
    }

    return businessDaysCount;
  }
}
