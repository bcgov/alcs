import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessDayService } from './business-day.service';
import { HolidayEntity } from './holiday.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HolidayEntity])],
  providers: [BusinessDayService],
  exports: [BusinessDayService],
})
export class BusinessDayModule {}
