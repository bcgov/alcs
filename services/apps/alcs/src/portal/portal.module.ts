import { ConfigModule } from '@app/common/config/config.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationModule } from '../alcs/application/application.module';
import { CardModule } from '../alcs/card/card.module';
import { NoticeOfIntentModule } from '../alcs/notice-of-intent/notice-of-intent.module';
import { DocumentModule } from '../document/document.module';
import { PortalApplicationDecisionModule } from './application-decision/application-decision.module';
import { PortalApplicationDocumentModule } from './application-document/application-document.module';
import { ApplicationSubmissionDraftModule } from './application-submission-draft/application-submission-draft.module';
import { ApplicationSubmissionReviewModule } from './application-submission-review/application-submission-review.module';
import { ApplicationSubmissionModule } from './application-submission/application-submission.module';
import { CodeController } from './code/code.controller';
import { PortalDocumentModule } from './document/document.module';
import { PortalNoticeOfIntentDecisionModule } from './notice-of-intent-decision/notice-of-intent-decision.module';
import { PortalNoticeOfIntentDocumentModule } from './notice-of-intent-document/notice-of-intent-document.module';
import { NoticeOfIntentSubmissionDraftModule } from './notice-of-intent-submission-draft/notice-of-intent-submission-draft.module';
import { NoticeOfIntentSubmissionModule } from './notice-of-intent-submission/notice-of-intent-submission.module';
import { ParcelModule } from './parcel/parcel.module';
import { PdfGenerationModule } from './pdf-generation/pdf-generation.module';
import { NotificationSubmissionModule } from './notification-submission/notification-submission.module';

@Module({
  imports: [
    ConfigModule,
    ApplicationModule,
    CardModule,
    ApplicationSubmissionModule,
    ParcelModule,
    ApplicationSubmissionReviewModule,
    PortalDocumentModule,
    DocumentModule,
    PortalApplicationDocumentModule,
    ApplicationSubmissionDraftModule,
    PdfGenerationModule,
    PortalApplicationDecisionModule,
    NoticeOfIntentModule,
    NoticeOfIntentSubmissionModule,
    PortalNoticeOfIntentDocumentModule,
    NoticeOfIntentSubmissionDraftModule,
    PortalNoticeOfIntentDecisionModule,
    NotificationSubmissionModule,
    RouterModule.register([
      { path: 'portal', module: ApplicationSubmissionModule },
      { path: 'portal', module: NoticeOfIntentSubmissionModule },
      { path: 'portal', module: ParcelModule },
      { path: 'portal', module: ApplicationSubmissionReviewModule },
      { path: 'portal', module: PortalDocumentModule },
      { path: 'portal', module: PortalApplicationDocumentModule },
      { path: 'portal', module: ApplicationSubmissionDraftModule },
      { path: 'portal', module: PdfGenerationModule },
      { path: 'portal', module: PortalApplicationDecisionModule },
      { path: 'portal', module: PortalNoticeOfIntentDocumentModule },
      { path: 'portal', module: NoticeOfIntentSubmissionDraftModule },
      { path: 'portal', module: PortalNoticeOfIntentDecisionModule },
      { path: 'portal', module: NotificationSubmissionModule },
    ]),
  ],
  controllers: [CodeController],
  providers: [],
})
export class PortalModule {}
