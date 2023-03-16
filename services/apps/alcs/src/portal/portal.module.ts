import { ConfigModule } from '@app/common/config/config.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationModule } from '../alcs/application/application.module';
import { ApplicationProposalModule } from './application-proposal/application-proposal.module';
import { ApplicationProposalReviewModule } from './application-proposal-review/application-proposal-review.module';
import { ParcelModule } from './parcel/parcel.module';

@Module({
  imports: [
    ConfigModule,
    ApplicationModule,
    ApplicationProposalModule,
    ParcelModule,
    ApplicationProposalReviewModule,
    RouterModule.register([
      { path: 'portal', module: ApplicationProposalModule },
      { path: 'portal', module: ParcelModule },
      { path: 'portal', module: ApplicationProposalReviewModule },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class PortalModule {}
