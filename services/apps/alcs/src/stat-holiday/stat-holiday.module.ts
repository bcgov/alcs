import { Module } from '@nestjs/common';
import { StatHolidayController } from './stat-holiday.controller';
import { StatHolidayService } from './stat-holiday.service';

@Module({
  controllers: [StatHolidayController],
  providers: [StatHolidayService],
})
export class StatHolidayModule {}
