import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidayController } from './holiday/holiday.controller';
import { HolidayEntity } from './holiday/holiday.entity';
import { HolidayService } from './holiday/holiday.service';

@Module({
  imports: [TypeOrmModule.forFeature([HolidayEntity])],
  controllers: [HolidayController],
  providers: [HolidayService],
})
export class AdminModule {}
