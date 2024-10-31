import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentParcelProfile } from '../../common/automapper/notice-of-intent-parcel.automapper.profile';
import { NoticeOfIntentProfile } from '../../common/automapper/notice-of-intent.automapper.profile';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { NoticeOfIntentOwner } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionModule } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { CodeModule } from '../code/code.module';
import { LocalGovernmentModule } from '../local-government/local-government.module';
import { NoticeOfIntentDocumentController } from './notice-of-intent-document/notice-of-intent-document.controller';
import { NoticeOfIntentDocument } from './notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from './notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentMeetingType } from './notice-of-intent-meeting/notice-of-intent-meeting-type.entity';
import { NoticeOfIntentMeetingController } from './notice-of-intent-meeting/notice-of-intent-meeting.controller';
import { NoticeOfIntentMeeting } from './notice-of-intent-meeting/notice-of-intent-meeting.entity';
import { NoticeOfIntentMeetingService } from './notice-of-intent-meeting/notice-of-intent-meeting.service';
import { NoticeOfIntentParcelController } from './notice-of-intent-parcel/notice-of-intent-parcel.controller';
import { NoticeOfIntentSubmissionStatusType } from './notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NoticeOfIntentSubmissionStatusModule } from './notice-of-intent-submission-status/notice-of-intent-submission-status.module';
import { NoticeOfIntentSubmissionController } from './notice-of-intent-submission/notice-of-intent-submission.controller';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentSubtype } from './notice-of-intent-subtype.entity';
import { NoticeOfIntentType } from './notice-of-intent-type/notice-of-intent-type.entity';
import { NoticeOfIntentController } from './notice-of-intent.controller';
import { NoticeOfIntent } from './notice-of-intent.entity';
import { NoticeOfIntentService } from './notice-of-intent.service';
import { TagModule } from '../tag/tag.module';
import { NoticeOfIntentTagService } from './notice-of-intent-tag/notice-of-intent-tag.service';
import { NoticeOfIntentTagController } from './notice-of-intent-tag/notice-of-intent-tag.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NoticeOfIntent,
      NoticeOfIntentMeeting,
      NoticeOfIntentMeetingType,
      NoticeOfIntentType,
      NoticeOfIntentSubtype,
      NoticeOfIntentDocument,
      NoticeOfIntentSubmission,
      NoticeOfIntentSubmissionStatusType,
      DocumentCode,
      NoticeOfIntentOwner,
    ]),
    forwardRef(() => BoardModule),
    CardModule,
    FileNumberModule,
    DocumentModule,
    CodeModule,
    LocalGovernmentModule,
    NoticeOfIntentSubmissionStatusModule,
    forwardRef(() => NoticeOfIntentSubmissionModule),
    TagModule,
  ],
  providers: [
    NoticeOfIntentService,
    NoticeOfIntentProfile,
    NoticeOfIntentMeetingService,
    NoticeOfIntentDocumentService,
    NoticeOfIntentSubmissionService,
    NoticeOfIntentParcelProfile,
    NoticeOfIntentTagService,
  ],
  controllers: [
    NoticeOfIntentController,
    NoticeOfIntentMeetingController,
    NoticeOfIntentDocumentController,
    NoticeOfIntentSubmissionController,
    NoticeOfIntentParcelController,
    NoticeOfIntentTagController,
  ],
  exports: [
    NoticeOfIntentService,
    NoticeOfIntentMeetingService,
    NoticeOfIntentDocumentService,
    NoticeOfIntentSubmissionService,
    NoticeOfIntentTagService,
  ],
})
export class NoticeOfIntentModule {}
