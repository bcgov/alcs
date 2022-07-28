import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'nest-keycloak-connect';
import { BusinessDayModule } from '../providers/business-days/business-day.module';
import { ApplicationHistory } from './application-history.entity';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationTimeTrackingService } from './application-time-tracking.service';
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
      ApplicationPaused,
    ]),
    BusinessDayModule,
  ],
  providers: [
    ApplicationService,
    ApplicationStatusService,
    ApplicationTimeTrackingService,
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
