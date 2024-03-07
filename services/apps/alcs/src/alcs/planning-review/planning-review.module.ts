import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningReviewProfile } from '../../common/automapper/planning-review.automapper.profile';
import { FileNumberModule } from '../../file-number/file-number.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { CodeModule } from '../code/code.module';
import { PlanningReferralController } from './planning-referral/planning-referral.controller';
import { PlanningReferral } from './planning-referral/planning-referral.entity';
import { PlanningReferralService } from './planning-referral/planning-referral.service';
import { PlanningReviewType } from './planning-review-type.entity';
import { PlanningReviewController } from './planning-review.controller';
import { PlanningReview } from './planning-review.entity';
import { PlanningReviewService } from './planning-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanningReview,
      PlanningReferral,
      PlanningReviewType,
    ]),
    forwardRef(() => BoardModule),
    CardModule,
    CodeModule,
    FileNumberModule,
  ],
  controllers: [PlanningReviewController, PlanningReferralController],
  providers: [
    PlanningReviewService,
    PlanningReviewProfile,
    PlanningReferralService,
  ],
  exports: [PlanningReviewService, PlanningReferralService],
})
export class PlanningReviewModule {}
