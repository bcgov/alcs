import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../../alcs/application/application.module';
import { ApplicationProposalReviewProfile } from '../../common/automapper/application-proposal-review.automapper.profile';
import { ApplicationProposalModule } from '../application-proposal/application-proposal.module';
import { ApplicationProposalReviewController } from './application-proposal-review.controller';
import { ApplicationProposalReview } from './application-proposal-review.entity';
import { ApplicationProposalReviewService } from './application-proposal-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationProposalReview]),
    ApplicationProposalModule,
    ApplicationModule,
  ],
  providers: [
    ApplicationProposalReviewService,
    ApplicationProposalReviewProfile,
  ],
  controllers: [ApplicationProposalReviewController],
})
export class ApplicationProposalReviewModule {}
