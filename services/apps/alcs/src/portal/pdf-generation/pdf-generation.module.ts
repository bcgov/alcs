import { CdogsModule } from '@app/common/cdogs/cdogs.module';
import { forwardRef, Module } from '@nestjs/common';
import { ApplicationModule } from '../../alcs/application/application.module';
import { NotificationModule } from '../../alcs/notification/notification.module';
import { ApplicationSubmissionReviewModule } from '../application-submission-review/application-submission-review.module';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { NotificationSubmissionModule } from '../notification-submission/notification-submission.module';
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
  ],
  providers: [
    GenerateSubmissionDocumentService,
    GenerateReviewDocumentService,
    GenerateSrwDocumentService,
  ],
  controllers: [PdfGenerationController],
  exports: [
    GenerateSubmissionDocumentService,
    GenerateReviewDocumentService,
    GenerateSrwDocumentService,
  ],
})
export class PdfGenerationModule {}
