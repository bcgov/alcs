import { ConfigModule } from '@app/common/config/config.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationModule } from '../alcs/application/application.module';
import { CardModule } from '../alcs/card/card.module';
import { DocumentModule } from '../document/document.module';
import { PortalApplicationDecisionModule } from './application-decision/application-decision.module';
import { PortalApplicationDocumentModule } from './application-document/application-document.module';
import { ApplicationSubmissionDraftModule } from './application-submission-draft/application-submission-draft.module';
import { ApplicationSubmissionReviewModule } from './application-submission-review/application-submission-review.module';
import { ApplicationSubmissionModule } from './application-submission/application-submission.module';
import { CodeController } from './code/code.controller';
import { PortalDocumentModule } from './document/document.module';
import { ParcelModule } from './parcel/parcel.module';
import { PdfGenerationModule } from './pdf-generation/pdf-generation.module';

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
    RouterModule.register([
      { path: 'portal', module: ApplicationSubmissionModule },
      { path: 'portal', module: ParcelModule },
      { path: 'portal', module: ApplicationSubmissionReviewModule },
      { path: 'portal', module: PortalDocumentModule },
      { path: 'portal', module: PortalApplicationDocumentModule },
      { path: 'portal', module: ApplicationSubmissionDraftModule },
      { path: 'portal', module: PdfGenerationModule },
      { path: 'portal', module: PortalApplicationDecisionModule },
    ]),
  ],
  controllers: [CodeController],
  providers: [],
})
export class PortalModule {}
