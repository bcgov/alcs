import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationSubmissionStatusModule } from '../../alcs/application/application-submission-status/application-submission-status.module';
import { NotificationSubmissionStatusModule } from '../../alcs/notification/notification-submission-status/notification-submission-status.module';
import { PublicSearchModule } from './search/public-search.module';
import { PublicStatusController } from './status/public-status.controller';

@Module({
  imports: [
    PublicSearchModule,
    ApplicationSubmissionStatusModule,
    NotificationSubmissionStatusModule,
    RouterModule.register([{ path: 'public', module: PublicSearchModule }]),
  ],
  controllers: [PublicStatusController],
  providers: [],
  exports: [],
})
export class PublicModule {}
