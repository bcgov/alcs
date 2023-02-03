import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatHolidayController } from './stat-holiday.controller';
import { HolidayEntity } from './stat-holiday.entity';
import { StatHolidayService } from './stat-holiday.service';

@Module({
  imports: [TypeOrmModule.forFeature([HolidayEntity])],
  controllers: [StatHolidayController],
  providers: [StatHolidayService],
})
export class StatHolidayModule {}
