import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardModule } from '../../alcs/board/board.module';
import { LocalGovernmentModule } from '../../alcs/local-government/local-government.module';
import { NoticeOfIntentSubmissionStatusType } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NoticeOfIntentSubmissionStatusModule } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.module';
import { NoticeOfIntentModule } from '../../alcs/notice-of-intent/notice-of-intent.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { NoticeOfIntentOwnerProfile } from '../../common/automapper/notice-of-intent-owner.automapper.profile';
import { NoticeOfIntentParcelProfile } from '../../common/automapper/notice-of-intent-parcel.automapper.profile';
import { NoticeOfIntentSubmissionProfile } from '../../common/automapper/notice-of-intent-submission.automapper.profile';
import { ParcelOwnershipType } from '../../common/entities/parcel-ownership-type/parcel-ownership-type.entity';
import { OwnerType } from '../../common/owner-type/owner-type.entity';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { NoticeOfIntentOwnerController } from './notice-of-intent-owner/notice-of-intent-owner.controller';
import { NoticeOfIntentOwner } from './notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentOwnerService } from './notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelController } from './notice-of-intent-parcel/notice-of-intent-parcel.controller';
import { NoticeOfIntentParcel } from './notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentParcelService } from './notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionValidatorService } from './notice-of-intent-submission-validator.service';
import { NoticeOfIntentSubmissionController } from './notice-of-intent-submission.controller';
import { NoticeOfIntentSubmission } from './notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NoticeOfIntentSubmission,
      NoticeOfIntentParcel,
      ParcelOwnershipType,
      OwnerType,
      NoticeOfIntentOwner,
      NoticeOfIntentSubmissionStatusType,
    ]),
    NoticeOfIntentSubmissionStatusModule,
    forwardRef(() => NoticeOfIntentModule),
    forwardRef(() => AuthorizationModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => BoardModule),
    LocalGovernmentModule,
    FileNumberModule,
  ],
  controllers: [
    NoticeOfIntentSubmissionController,
    NoticeOfIntentParcelController,
    NoticeOfIntentOwnerController,
  ],
  providers: [
    NoticeOfIntentSubmissionService,
    NoticeOfIntentParcelService,
    NoticeOfIntentOwnerService,
    NoticeOfIntentSubmissionValidatorService,
    NoticeOfIntentSubmissionProfile,
    NoticeOfIntentOwnerProfile,
    NoticeOfIntentParcelProfile,
  ],
  exports: [
    NoticeOfIntentSubmissionService,
    NoticeOfIntentParcelService,
    NoticeOfIntentParcelProfile,
    NoticeOfIntentOwnerService,
  ],
})
export class NoticeOfIntentSubmissionModule {}
