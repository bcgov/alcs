import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlcsModule } from '../alcs/alcs.module';
import { ApplicationModule } from '../application/application.module';
import { ApplicationReviewProfile } from '../common/automapper/application-review.automapper.profile';
import { ApplicationReviewController } from './application-review.controller';
import { ApplicationProposalReview } from './application-review.entity';
import { ApplicationReviewService } from './application-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationProposalReview]),
    ApplicationModule,
    AlcsModule,
  ],
  providers: [ApplicationReviewService, ApplicationReviewProfile],
  controllers: [ApplicationReviewController],
})
export class ApplicationReviewModule {}
