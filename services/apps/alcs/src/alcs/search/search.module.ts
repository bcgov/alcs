import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { Application } from '../application/application.entity';
import { Covenant } from '../covenant/covenant.entity';
import { LocalGovernment } from '../local-government/local-government.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { ApplicationAdvancedSearchService } from './application/application-advanced-search.service';
import { ApplicationSubmissionSearchView } from './application/application-search-view.entity';
import { NoticeOfIntentAdvancedSearchService } from './notice-of-intent/notice-of-intent-advanced-search.service';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent/notice-of-intent-search-view.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      NoticeOfIntent,
      PlanningReview,
      Covenant,
      LocalGovernment,
      ApplicationSubmissionSearchView,
      NoticeOfIntentSubmissionSearchView,
    ]),
  ],
  providers: [
    SearchService,
    ApplicationProfile,
    ApplicationAdvancedSearchService,
    NoticeOfIntentAdvancedSearchService,
  ],
  controllers: [SearchController],
})
export class SearchModule {}
