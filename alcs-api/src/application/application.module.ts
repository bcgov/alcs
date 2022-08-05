import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'nest-keycloak-connect';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { BusinessDayModule } from '../providers/business-days/business-day.module';
import { ApplicationHistory } from './application-history.entity';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationStatusController } from './application-status/application-status.controller';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationStatusService } from './application-status/application-status.service';
import { ApplicationTimeTrackingService } from './application-time-tracking.service';
import { ApplicationTypeController } from './application-type/application-type.controller';
import { ApplicationType } from './application-type/application-type.entity';
import { ApplicationTypeService } from './application-type/application-type.service';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';
import { ApplicationSubscriber } from './application.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationStatus,
      ApplicationType,
      Application,
      ApplicationHistory,
      ApplicationPaused,
    ]),
    BusinessDayModule,
  ],
  providers: [
    ApplicationService,
    ApplicationStatusService,
    ApplicationTypeService,
    ApplicationTimeTrackingService,
    ApplicationSubscriber,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    ApplicationProfile,
  ],
  controllers: [
    ApplicationController,
    ApplicationStatusController,
    ApplicationTypeController,
  ],
  exports: [ApplicationService, ApplicationTimeTrackingService],
})
export class ApplicationModule {}
