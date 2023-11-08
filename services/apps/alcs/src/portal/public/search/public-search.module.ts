import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../../../alcs/application/application.entity';
import { LocalGovernment } from '../../../alcs/local-government/local-government.entity';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { Notification } from '../../../alcs/notification/notification.entity';
import { ApplicationProfile } from '../../../common/automapper/application.automapper.profile';
import { PublicApplicationSearchService } from './application/public-application-search.service';
import { PublicApplicationSubmissionSearchView } from './application/public-application-search-view.entity';
import { PublicNoticeOfIntentSearchService } from './notice-of-intent/public-notice-of-intent-search.service';
import { PublicNoticeOfIntentSubmissionSearchView } from './notice-of-intent/public-notice-of-intent-search-view.entity';
import { PublicNotificationSearchService } from './notification/public-notification-search.service';
import { PublicNotificationSubmissionSearchView } from './notification/public-notification-search-view.entity';
import { PublicSearchController } from './public-search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      NoticeOfIntent,
      Notification,
      LocalGovernment,
      PublicApplicationSubmissionSearchView,
      PublicNoticeOfIntentSubmissionSearchView,
      PublicNotificationSubmissionSearchView,
    ]),
  ],
  providers: [
    ApplicationProfile,
    PublicApplicationSearchService,
    PublicNoticeOfIntentSearchService,
    PublicNotificationSearchService,
  ],
  controllers: [PublicSearchController],
})
export class PublicSearchModule {}
