import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'nest-keycloak-connect';
import { BusinessDayModule } from '../providers/business-days/business-day.module';
import { BusinessDayService } from '../providers/business-days/business-day.service';
import { ApplicationHistory } from './application-history.entity';
import { ApplicationStatusController } from './application-status/application-status.controller';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationStatusService } from './application-status/application-status.service';
import { ApplicationSubscriber } from './application.subscriber';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationStatus,
      Application,
      ApplicationHistory,
    ]),
    BusinessDayModule,
  ],
  providers: [
    ApplicationService,
    ApplicationStatusService,
    ApplicationSubscriber,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [ApplicationController, ApplicationStatusController],
  exports: [ApplicationService],
})
export class ApplicationModule {}
