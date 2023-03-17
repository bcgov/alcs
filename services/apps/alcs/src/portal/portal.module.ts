import { ConfigModule } from '@app/common/config/config.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationModule } from '../alcs/application/application.module';
import { CardModule } from '../alcs/card/card.module';
import { ApplicationSubmissionReviewModule } from './application-submission-review/application-submission-review.module';
import { ApplicationSubmissionModule } from './application-submission/application-submission.module';
import { CodeController } from './code/code.controller';
import { ParcelModule } from './parcel/parcel.module';

@Module({
  imports: [
    ConfigModule,
    ApplicationModule,
    CardModule,
    ApplicationSubmissionModule,
    ParcelModule,
    ApplicationSubmissionReviewModule,
    RouterModule.register([
      { path: 'portal', module: ApplicationSubmissionModule },
      { path: 'portal', module: ParcelModule },
      { path: 'portal', module: ApplicationSubmissionReviewModule },
    ]),
  ],
  controllers: [CodeController],
  providers: [],
})
export class PortalModule {}
