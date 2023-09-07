import { Module } from '@nestjs/common';
import { NotificationModule } from '../../alcs/notification/notification.module';
import { DocumentModule } from '../../document/document.module';
import { NotificationSubmissionModule } from '../notification-submission/notification-submission.module';
import { NotificationDocumentController } from './notification-document.controller';

@Module({
  imports: [DocumentModule, NotificationModule, NotificationSubmissionModule],
  controllers: [NotificationDocumentController],
  providers: [],
  exports: [],
})
export class PortalNotificationDocumentModule {}
