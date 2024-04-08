import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningReviewProfile } from '../../common/automapper/planning-review.automapper.profile';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { CodeModule } from '../code/code.module';
import { PlanningReferralController } from './planning-referral/planning-referral.controller';
import { PlanningReferral } from './planning-referral/planning-referral.entity';
import { PlanningReferralService } from './planning-referral/planning-referral.service';
import { PlanningReviewDocumentController } from './planning-review-document/planning-review-document.controller';
import { PlanningReviewDocument } from './planning-review-document/planning-review-document.entity';
import { PlanningReviewDocumentService } from './planning-review-document/planning-review-document.service';
import { PlanningReviewMeetingType } from './planning-review-meeting/planning-review-meeting-type.entity';
import { PlanningReviewMeetingController } from './planning-review-meeting/planning-review-meeting.controller';
import { PlanningReviewMeeting } from './planning-review-meeting/planning-review-meeting.entity';
import { PlanningReviewMeetingService } from './planning-review-meeting/planning-review-meeting.service';
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
      PlanningReviewDocument,
      PlanningReviewMeeting,
      PlanningReviewMeetingType,
      DocumentCode,
    ]),
    forwardRef(() => BoardModule),
    CardModule,
    CodeModule,
    FileNumberModule,
    DocumentModule,
  ],
  controllers: [
    PlanningReviewController,
    PlanningReferralController,
    PlanningReviewDocumentController,
    PlanningReviewMeetingController,
  ],
  providers: [
    PlanningReviewService,
    PlanningReviewProfile,
    PlanningReferralService,
    PlanningReviewDocumentService,
    PlanningReviewMeetingService,
  ],
  exports: [
    PlanningReviewService,
    PlanningReferralService,
    PlanningReviewMeetingService,
  ],
})
export class PlanningReviewModule {}
