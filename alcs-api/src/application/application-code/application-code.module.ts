import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessDayModule } from '../../providers/business-days/business-day.module';
import { ApplicationDecisionMaker } from './application-decision-maker/application-decision-maker.entity';
import { ApplicationStatus } from '../application-status/application-status.entity';
import { ApplicationType } from './application-type/application-type.entity';
import { ApplicationCodeController } from './application-code.controller';
import { ApplicationCodeService } from './application-code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationStatus,
      ApplicationType,
      ApplicationDecisionMaker,
    ]),
    BusinessDayModule,
  ],
  providers: [ApplicationCodeService],
  controllers: [ApplicationCodeController],
  exports: [ApplicationCodeService],
})
export class ApplicationCodeModule {}
