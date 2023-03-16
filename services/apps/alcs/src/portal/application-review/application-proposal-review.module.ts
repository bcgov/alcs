import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlcsModule } from '../alcs/alcs.module';
import { ApplicationProposalModule } from '../application-proposal/application-proposal.module';
import { ApplicationReviewProfile } from '../common/automapper/application-review.automapper.profile';
import { ApplicationProposalReviewController } from './application-proposal-review.controller';
import { ApplicationProposalReview } from './application-proposal-review.entity';
import { ApplicationProposalReviewService } from './application-proposal-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationProposalReview]),
    ApplicationProposalModule,
    AlcsModule,
  ],
  providers: [ApplicationProposalReviewService, ApplicationReviewProfile],
  controllers: [ApplicationProposalReviewController],
})
export class ApplicationProposalReviewModule {}
