import { Module } from '@nestjs/common';
import { BusinessDayService } from './business-day.service';

@Module({
  imports: [],
  providers: [BusinessDayService],
  exports: [BusinessDayService],
})
export class BusinessDayModule {}
