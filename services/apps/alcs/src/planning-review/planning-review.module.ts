import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { CodeModule } from '../code/code.module';
import { PlanningReviewProfile } from '../common/automapper/planning-meeting.automapper.profile';
import { PlanningReviewController } from './planning-review.controller';
import { PlanningReview } from './planning-review.entity';
import { PlanningReviewService } from './planning-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanningReview]),
    forwardRef(() => BoardModule),
    CardModule,
    CodeModule,
  ],
  controllers: [PlanningReviewController],
  providers: [PlanningReviewService, PlanningReviewProfile],
  exports: [PlanningReviewService],
})
export class PlanningReviewModule {}
