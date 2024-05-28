import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../../../alcs/application/application.entity';
import { ApplicationType } from '../../../alcs/code/application-code/application-type/application-type.entity';
import { LocalGovernment } from '../../../alcs/local-government/local-government.entity';
import { NoticeOfIntentType } from '../../../alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.entity';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { NotificationType } from '../../../alcs/notification/notification-type/notification-type.entity';
import { Notification } from '../../../alcs/notification/notification.entity';
import { ApplicationProfile } from '../../../common/automapper/application.automapper.profile';
import { ApplicationSubmission } from '../../application-submission/application-submission.entity';
import { NoticeOfIntentSubmission } from '../../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NotificationSubmission } from '../../notification-submission/notification-submission.entity';
import { PublicApplicationSubmissionSearchView } from './application/public-application-search-view.entity';
import { PublicApplicationSearchService } from './application/public-application-search.service';
import { PublicNoticeOfIntentSubmissionSearchView } from './notice-of-intent/public-notice-of-intent-search-view.entity';
import { PublicNoticeOfIntentSearchService } from './notice-of-intent/public-notice-of-intent-search.service';
import { PublicNotificationSubmissionSearchView } from './notification/public-notification-search-view.entity';
import { PublicNotificationSearchService } from './notification/public-notification-search.service';
import { PublicSearchController } from './public-search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationSubmission,
      ApplicationType,
      NoticeOfIntent,
      NoticeOfIntentSubmission,
      NoticeOfIntentType,
      Notification,
      NotificationSubmission,
      NotificationType,
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
