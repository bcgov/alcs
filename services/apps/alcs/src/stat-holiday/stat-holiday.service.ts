import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { HolidayEntity } from './stat-holiday.entity';

@Injectable()
export class StatHolidayService {
  constructor(
    @InjectRepository(HolidayEntity)
    private holidayRepository: Repository<HolidayEntity>,
  ) {}

  async fetch(pageNumber: number, itemsPerPage: number, search?: number) {
    let searchExpression: FindOptionsWhere<HolidayEntity> | undefined =
      undefined;

    if (search) {
      console.log('search', search);
      searchExpression = {
        day: Between(new Date(search, 0), new Date(search, 12)),
      };
    }

    console.log('paging', itemsPerPage, pageNumber * itemsPerPage, search);

    return await this.holidayRepository.findAndCount({
      where: searchExpression,
      order: { day: 'DESC' },
      take: itemsPerPage,
      skip: pageNumber * itemsPerPage,
    });
  }
}
