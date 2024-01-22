import { Module } from '@nestjs/common';
import { NoticeOfIntentModule } from '../../alcs/notice-of-intent/notice-of-intent.module';
import { DocumentModule } from '../../document/document.module';
import { NoticeOfIntentSubmissionModule } from '../notice-of-intent-submission/notice-of-intent-submission.module';
import { NoticeOfIntentDocumentController } from './notice-of-intent-document.controller';

@Module({
  imports: [
    DocumentModule,
    NoticeOfIntentModule,
    NoticeOfIntentSubmissionModule,
  ],
  controllers: [NoticeOfIntentDocumentController],
  providers: [],
  exports: [],
})
export class PortalNoticeOfIntentDocumentModule {}
