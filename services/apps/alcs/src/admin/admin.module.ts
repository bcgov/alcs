import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { HolidayController } from './holiday/holiday.controller';
import { HolidayEntity } from './holiday/holiday.entity';
import { HolidayService } from './holiday/holiday.service';
import { LocalGovernmentController } from './local-government/local-government.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HolidayEntity]), ApplicationModule],
  controllers: [HolidayController, LocalGovernmentController],
  providers: [HolidayService],
})
export class AdminModule {}
