import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { HolidayCreateDto, HolidayUpdateDto } from './stat-holiday.dto';
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
      searchExpression = {
        day: Between(new Date(search, 0), new Date(search, 12)),
      };
    }

    return await this.holidayRepository.findAndCount({
      where: searchExpression,
      order: { day: 'DESC' },
      take: itemsPerPage,
      skip: pageNumber * itemsPerPage,
    });
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
}
