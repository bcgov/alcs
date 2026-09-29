import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NotificationSubmission } from '../../portal/notification-submission/notification-submission.entity';
import { Application } from '../application/application.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement/compliance-and-enforcement.entity';
import { Inquiry } from '../inquiry/inquiry.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { Notification } from '../notification/notification.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { ApplicationAdvancedSearchService } from './application/application-advanced-search.service';
import { ApplicationSubmissionSearchView } from './application/application-search-view.entity';
import { ComplianceAndEnforcementAdvancedSearchService } from './compliance-and-enforcement/compliance-and-enforcement-advanced-search.service';
import { ComplianceAndEnforcementSearchView } from './compliance-and-enforcement/compliance-and-enforcement-search-view.entity';
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
import { ApplicationSubmissionStatusSearchView } from './status/application-search-status-view.entity';
import { NoiSubmissionStatusSearchView } from './status/noi-search-status-view.entity';
import { NotificationSubmissionStatusSearchView } from './status/notification-search-status-view.entity';
import { SearchStatusService } from './status/search-status.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationType,
      ApplicationSubmission,
      ApplicationSubmissionSearchView,
      NoticeOfIntent,
      NoticeOfIntentSubmission,
      NoticeOfIntentSubmissionSearchView,
      PlanningReview,
      PlanningReviewSearchView,
      Notification,
      NotificationSubmission,
      NotificationSubmissionSearchView,
      Inquiry,
      InquirySearchView,
      ComplianceAndEnforcement,
      ComplianceAndEnforcementSearchView,
      LocalGovernment,
      ApplicationSubmissionStatusSearchView,
      NoiSubmissionStatusSearchView,
      NotificationSubmissionStatusSearchView,
      ComplianceAndEnforcement,
      ComplianceAndEnforcementSearchView,
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
    ComplianceAndEnforcementAdvancedSearchService,
    SearchStatusService,
  ],
  controllers: [SearchController],
})
export class SearchModule {}
