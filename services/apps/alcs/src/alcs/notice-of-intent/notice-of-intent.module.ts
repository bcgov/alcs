import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentProfile } from '../../common/automapper/notice-of-intent.automapper.profile';
import { FileNumberModule } from '../../file-number/file-number.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';

import { NoticeOfIntentMeetingType } from './notice-of-intent-meeting/notice-of-intent-meeting-type.entity';
import { NoticeOfIntentMeetingController } from './notice-of-intent-meeting/notice-of-intent-meeting.controller';
import { NoticeOfIntentMeeting } from './notice-of-intent-meeting/notice-of-intent-meeting.entity';
import { NoticeOfIntentMeetingService } from './notice-of-intent-meeting/notice-of-intent-meeting.service';
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
      NoticeOfIntentSubtype,
    ]),
    forwardRef(() => BoardModule),
    CardModule,
    FileNumberModule,
  ],
  providers: [
    NoticeOfIntentService,
    NoticeOfIntentProfile,
    NoticeOfIntentMeetingService,
  ],
  controllers: [NoticeOfIntentController, NoticeOfIntentMeetingController],
  exports: [NoticeOfIntentService],
})
export class NoticeOfIntentModule {}
