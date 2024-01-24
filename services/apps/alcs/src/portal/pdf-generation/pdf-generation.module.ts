import { CdogsModule } from '@app/common/cdogs/cdogs.module';
import { forwardRef, Module } from '@nestjs/common';
import { ApplicationModule } from '../../alcs/application/application.module';
import { NoticeOfIntentModule } from '../../alcs/notice-of-intent/notice-of-intent.module';
import { NotificationModule } from '../../alcs/notification/notification.module';
import { ApplicationSubmissionReviewModule } from '../application-submission-review/application-submission-review.module';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { NoticeOfIntentSubmissionModule } from '../notice-of-intent-submission/notice-of-intent-submission.module';
import { NotificationSubmissionModule } from '../notification-submission/notification-submission.module';
import { GenerateNoiSubmissionDocumentService } from './generate-noi-submission-document.service';
import { GenerateReviewDocumentService } from './generate-review-document.service';
import { GenerateSrwDocumentService } from './generate-srw-document.service';
import { GenerateSubmissionDocumentService } from './generate-submission-document.service';
import { PdfGenerationController } from './pdf-generation.controller';

@Module({
  imports: [
    CdogsModule,
    forwardRef(() => ApplicationSubmissionModule),
    forwardRef(() => ApplicationModule),
    forwardRef(() => ApplicationSubmissionReviewModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => NotificationSubmissionModule),
    forwardRef(() => NoticeOfIntentModule),
    forwardRef(() => NoticeOfIntentSubmissionModule),
  ],
  providers: [
    GenerateSubmissionDocumentService,
    GenerateReviewDocumentService,
    GenerateSrwDocumentService,
    GenerateNoiSubmissionDocumentService,
  ],
  controllers: [PdfGenerationController],
  exports: [
    GenerateNoiSubmissionDocumentService,
    GenerateSubmissionDocumentService,
    GenerateReviewDocumentService,
    GenerateSrwDocumentService,
  ],
})
export class PdfGenerationModule {}
