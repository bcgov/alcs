import { ConfigModule } from '@app/common/config/config.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationModule } from '../alcs/application/application.module';
import { CardModule } from '../alcs/card/card.module';
import { CodeModule } from '../alcs/code/code.module';
import { NoticeOfIntentModule } from '../alcs/notice-of-intent/notice-of-intent.module';
import { DocumentModule } from '../document/document.module';
import { PortalApplicationDocumentModule } from './application-document/application-document.module';
import { ApplicationSubmissionDraftModule } from './application-submission-draft/application-submission-draft.module';
import { ApplicationSubmissionReviewModule } from './application-submission-review/application-submission-review.module';
import { ApplicationSubmissionModule } from './application-submission/application-submission.module';
import { CodeController } from './code/code.controller';
import { PortalDocumentModule } from './document/document.module';
import { InboxModule } from './inbox/inbox.module';
import { PortalNoticeOfIntentDocumentModule } from './notice-of-intent-document/notice-of-intent-document.module';
import { NoticeOfIntentSubmissionDraftModule } from './notice-of-intent-submission-draft/notice-of-intent-submission-draft.module';
import { NoticeOfIntentSubmissionModule } from './notice-of-intent-submission/notice-of-intent-submission.module';
import { PortalNotificationDocumentModule } from './notification-document/notification-document.module';
import { ParcelModule } from './parcel/parcel.module';
import { PdfGenerationModule } from './pdf-generation/pdf-generation.module';
import { NotificationSubmissionModule } from './notification-submission/notification-submission.module';
import { PublicModule } from './public/public.module';
import { ConfigurationModule } from './configuration/configuration.module';

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
    NoticeOfIntentModule,
    NoticeOfIntentSubmissionModule,
    PortalNoticeOfIntentDocumentModule,
    NoticeOfIntentSubmissionDraftModule,
    NotificationSubmissionModule,
    PortalNotificationDocumentModule,
    PublicModule,
    CodeModule,
    InboxModule,
    ConfigurationModule,
    RouterModule.register([
      { path: 'portal', module: ApplicationSubmissionModule },
      { path: 'portal', module: NoticeOfIntentSubmissionModule },
      { path: 'portal', module: ParcelModule },
      { path: 'portal', module: ApplicationSubmissionReviewModule },
      { path: 'portal', module: PortalDocumentModule },
      { path: 'portal', module: PortalApplicationDocumentModule },
      { path: 'portal', module: ApplicationSubmissionDraftModule },
      { path: 'portal', module: PdfGenerationModule },
      { path: 'portal', module: PortalNoticeOfIntentDocumentModule },
      { path: 'portal', module: NoticeOfIntentSubmissionDraftModule },
      { path: 'portal', module: NotificationSubmissionModule },
      { path: 'portal', module: PortalNotificationDocumentModule },
      { path: 'portal', module: InboxModule },
      { path: 'portal', module: ConfigurationModule },
    ]),
  ],
  controllers: [CodeController],
  providers: [],
})
export class PortalModule {}
