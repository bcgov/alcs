import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { Application } from '../application/application.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { Inquiry } from '../inquiry/inquiry.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { Notification } from '../notification/notification.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { ApplicationAdvancedSearchService } from './application/application-advanced-search.service';
import { ApplicationSubmissionSearchView } from './application/application-search-view.entity';
import { InquiryAdvancedSearchService } from './inquiry/inquiry-advanced-search.service';
import { InquirySearchView } from './inquiry/inquiry-search-view.entity';
import { NoticeOfIntentAdvancedSearchService } from './notice-of-intent/notice-of-intent-advanced-search.service';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent/notice-of-intent-search-view.entity';
import { NotificationAdvancedSearchService } from './notification/notification-advanced-search.service';
import { NotificationSubmissionSearchView } from './notification/notification-search-view.entity';
import { PlanningReviewAdvancedSearchService } from './planning-review/planning-review-advanced-search.service';
import { PlanningReviewSearchView } from './planning-review/planning-review-search-view.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationType,
      NoticeOfIntent,
      PlanningReview,
      Notification,
      Inquiry,
      LocalGovernment,
      ApplicationSubmissionSearchView,
      NoticeOfIntentSubmissionSearchView,
      NotificationSubmissionSearchView,
      PlanningReviewSearchView,
      InquirySearchView,
    ]),
  ],
  providers: [
    SearchService,
    ApplicationProfile,
    ApplicationAdvancedSearchService,
    NoticeOfIntentAdvancedSearchService,
    NotificationAdvancedSearchService,
    PlanningReviewAdvancedSearchService,
    InquiryAdvancedSearchService,
  ],
  controllers: [SearchController],
})
export class SearchModule {}
