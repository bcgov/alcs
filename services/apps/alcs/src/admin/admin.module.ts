import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { CeoCriterionCode } from '../decision/application-decision/ceo-criterion/ceo-criterion.entity';
import { CeoCriterionController } from './ceo-criterion/ceo-criterion.controller';
import { CeoCriterionService } from './ceo-criterion/ceo-criterion.service';
import { HolidayController } from './holiday/holiday.controller';
import { HolidayEntity } from './holiday/holiday.entity';
import { HolidayService } from './holiday/holiday.service';
import { LocalGovernmentController } from './local-government/local-government.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([HolidayEntity, CeoCriterionCode]),
    ApplicationModule,
  ],
  controllers: [
    HolidayController,
    LocalGovernmentController,
    CeoCriterionController,
  ],
  providers: [HolidayService, CeoCriterionService],
})
export class AdminModule {}
