import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentProfile } from '../../common/automapper/notice-of-intent.automapper.profile';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { NoticeOfIntentType } from '../code/application-code/notice-of-intent-type/notice-of-intent-type.entity';
import { CodeModule } from '../code/code.module';
import { LocalGovernmentModule } from '../local-government/local-government.module';
import { NoticeOfIntentDocumentController } from './notice-of-intent-document/notice-of-intent-document.controller';
import { NoticeOfIntentDocument } from './notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from './notice-of-intent-document/notice-of-intent-document.service';

import { NoticeOfIntentMeetingType } from './notice-of-intent-meeting/notice-of-intent-meeting-type.entity';
import { NoticeOfIntentMeetingController } from './notice-of-intent-meeting/notice-of-intent-meeting.controller';
import { NoticeOfIntentMeeting } from './notice-of-intent-meeting/notice-of-intent-meeting.entity';
import { NoticeOfIntentMeetingService } from './notice-of-intent-meeting/notice-of-intent-meeting.service';
import { NoticeOfIntentSubmissionStatusModule } from './notice-of-intent-submission-status/notice-of-intent-submission-status.module';
import { NoticeOfIntentController } from './notice-of-intent.controller';

import { NoticeOfIntentSubtype } from './notice-of-intent-subtype.entity';

import { NoticeOfIntent } from './notice-of-intent.entity';
import { NoticeOfIntentService } from './notice-of-intent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NoticeOfIntent,
      NoticeOfIntentMeeting,
      NoticeOfIntentMeetingType,
      NoticeOfIntentType,
      NoticeOfIntentSubtype,
      NoticeOfIntentDocument,
      DocumentCode,
    ]),
    forwardRef(() => BoardModule),
    CardModule,
    FileNumberModule,
    DocumentModule,
    CodeModule,
    LocalGovernmentModule,
    NoticeOfIntentSubmissionStatusModule,
  ],
  providers: [
    NoticeOfIntentService,
    NoticeOfIntentProfile,
    NoticeOfIntentMeetingService,
    NoticeOfIntentDocumentService,
  ],
  controllers: [
    NoticeOfIntentController,
    NoticeOfIntentMeetingController,
    NoticeOfIntentDocumentController,
  ],
  exports: [
    NoticeOfIntentService,
    NoticeOfIntentMeetingService,
    NoticeOfIntentDocumentService,
  ],
})
export class NoticeOfIntentModule {}
