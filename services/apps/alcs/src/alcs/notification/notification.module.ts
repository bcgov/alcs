import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationProfile } from '../../common/automapper/notification.automapper.profile';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { CodeModule } from '../code/code.module';
import { LocalGovernmentModule } from '../local-government/local-government.module';
import { NotificationDocumentController } from './notification-document/notification-document.controller';
import { NotificationDocument } from './notification-document/notification-document.entity';
import { NotificationDocumentService } from './notification-document/notification-document.service';
import { NotificationSubmissionStatusModule } from './notification-submission-status/notification-submission-status.module';
import { NotificationType } from './notification-type/notification-type.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationType,
      NotificationDocument,
      DocumentCode,
    ]),
    forwardRef(() => BoardModule),
    CardModule,
    FileNumberModule,
    DocumentModule,
    CodeModule,
    LocalGovernmentModule,
    NotificationSubmissionStatusModule,
  ],
  providers: [
    NotificationService,
    NotificationProfile,
    NotificationDocumentService,
  ],
  controllers: [NotificationController, NotificationDocumentController],
  exports: [NotificationService, NotificationDocumentService],
})
export class NotificationModule {}
