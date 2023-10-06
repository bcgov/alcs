import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationSubmissionStatusModule } from '../../alcs/application/application-submission-status/application-submission-status.module';
import { ApplicationModule } from '../../alcs/application/application.module';
import { NotificationSubmissionStatusModule } from '../../alcs/notification/notification-submission-status/notification-submission-status.module';
import { ApplicationSubmissionProfile } from '../../common/automapper/application-submission.automapper.profile';
import { PublicAutomapperProfile } from '../../common/automapper/public.automapper.profile';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { PublicController } from './public.controller';
import { PublicSearchModule } from './search/public-search.module';
import { PublicStatusController } from './status/public-status.controller';

@Module({
  imports: [
    PublicSearchModule,
    ApplicationSubmissionStatusModule,
    NotificationSubmissionStatusModule,
    ApplicationModule,
    ApplicationSubmissionModule,
    RouterModule.register([{ path: 'public', module: PublicSearchModule }]),
  ],
  controllers: [PublicStatusController, PublicController],
  providers: [PublicAutomapperProfile],
  exports: [],
})
export class PublicModule {}
