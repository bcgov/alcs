import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardModule } from '../../alcs/board/board.module';
import { LocalGovernmentModule } from '../../alcs/local-government/local-government.module';
import { NotificationSubmissionStatusModule } from '../../alcs/notification/notification-submission-status/notification-submission-status.module';
import { NotificationModule } from '../../alcs/notification/notification.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { NotificationParcelProfile } from '../../common/automapper/notification-parcel.automapper.profile';
import { NotificationSubmissionProfile } from '../../common/automapper/notification-submission.automapper.profile';
import { NotificationTransfereeProfile } from '../../common/automapper/notification-transferee.automapper.profile';
import { OwnerType } from '../../common/owner-type/owner-type.entity';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { PdfGenerationModule } from '../pdf-generation/pdf-generation.module';
import { NotificationParcelController } from './notification-parcel/notification-parcel.controller';
import { NotificationParcel } from './notification-parcel/notification-parcel.entity';
import { NotificationParcelService } from './notification-parcel/notification-parcel.service';
import { NotificationSubmissionValidatorService } from './notification-submission-validator.service';
import { NotificationSubmissionController } from './notification-submission.controller';
import { NotificationSubmission } from './notification-submission.entity';
import { NotificationSubmissionService } from './notification-submission.service';
import { NotificationTransfereeController } from './notification-transferee/notification-transferee.controller';
import { NotificationTransferee } from './notification-transferee/notification-transferee.entity';
import { NotificationTransfereeService } from './notification-transferee/notification-transferee.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationSubmission,
      NotificationParcel,
      OwnerType,
      NotificationTransferee,
    ]),
    forwardRef(() => NotificationModule),
    forwardRef(() => AuthorizationModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => BoardModule),
    forwardRef(() => PdfGenerationModule),
    LocalGovernmentModule,
    FileNumberModule,
    NotificationSubmissionStatusModule,
  ],
  controllers: [
    NotificationSubmissionController,
    NotificationParcelController,
    NotificationTransfereeController,
  ],
  providers: [
    NotificationSubmissionService,
    NotificationSubmissionValidatorService,
    NotificationParcelService,
    NotificationTransfereeService,
    NotificationSubmissionProfile,
    NotificationTransfereeProfile,
    NotificationParcelProfile,
  ],
  exports: [
    NotificationSubmissionService,
    NotificationParcelService,
    NotificationParcelProfile,
    NotificationTransfereeService,
  ],
})
export class NotificationSubmissionModule {}
