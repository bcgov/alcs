import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentProfile } from '../../common/automapper/notice-of-intent.automapper.profile';
import { FileNumberModule } from '../../file-number/file-number.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { NoticeOfIntentMeetingController } from './notice-of-intent-meeting/notice-of-intent-meeting.controller';
import { NoticeOfIntentMeetingService } from './notice-of-intent-meeting/notice-of-intent-meeting.service';
import { NoticeOfIntentController } from './notice-of-intent.controller';
import { NoticeOfIntent } from './notice-of-intent.entity';
import { NoticeOfIntentService } from './notice-of-intent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NoticeOfIntent]),
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
